const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const util = require('util');
const _ = require('lodash');
var ObjectId = require('mongoose').Types.ObjectId;


const User = mongoose.model('User');
const Package = mongoose.model('Package');

module.exports.register = (req, role, res, next) => {
  const url = req.protocol + "://" + req.get('host');
  console.log(req.body);
  var user = new User();
  user.login = req.body.login;
  user.password = req.body.password;
  user.society = req.body.society;
  user.activity = req.body.activity;
  user.phone = req.body.phone;
  user.mail = req.body.mail;
  user.role = role;
  user.role == "fournisseur" && req.body.etat != 'approuvé' ? user.etat = "en attente" : user.etat = req.body.etat;
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.adress = req.body.adress;
  if (req.file) {
    user.image = url + '/images/' + req.file.filename;
  } else user.image = url + '/images/defaultImage.png';
  console.log(user.image);
  user.save((err, doc) => {
    if (!err)
      res.send(doc);
    else {
      if (err.code == 11000)
        res.status(422).send(['Duplicate email adrress or login.']);
      else
        return next(err);
    }

  });
}
module.exports.resetpassword = async (req, res, next) => {
  let user = await User.findById(req.body.id);
  if (!bcrypt.compareSync(req.body.password, user.password)) return res.status(400).json({ 'message': 'mot de passe incorrect' })
  user.password = req.body.newpassword;
  user.save()
    .then(user => {
      res.status(200).json(user);
    }
    )
    .catch(err => {
      res.send(err);
    })
}
module.exports.authenticate = (req, res, next) => {
  // call for passport authentication
  passport.authenticate('local', (err, user, info) => {
    // error from passport middleware
    if (err) return res.status(400).json(err);
    // registered user
    else if (user) {
      if (user.role == "fournisseur" && user.etat == "en attente") {
        return res.status(400).json({ "message": "you need to wait" });
      } else if (user.role == "client") return res.status(400).json({ "message": "wrong platform" });

      return res.status(200).json({ "token": user.generateJwt() });
    }
    // unknown user or wrong password
    else return res.status(404).json(info);
  })(req, res);
}

module.exports.userProfile = async (req, res, next) => {
  console.log('wselt lena ')
  const user = User.findOne({ _id: req._id });

  if (!user)
    return res.status(404).json({ status: false, message: 'User record not found.' });
  else
    return res.status(200).json({ status: true, user: _.pick(user, ['_id', 'society', 'login', 'activity', 'etat', 'firstName', 'lastName', 'adress', 'phone', 'mail', 'role', 'image']) });

}
//list fournisseur
module.exports.list = (req, res, next) => {
  User.find({ role: 'fournisseur' }, (err, docs) => {
    if (!err) { res.send(docs); }
    else { console.log('Error in Retriving users :' + JSON.stringify(err, undefined, 2)); }
  });
}
//list fournisseur en attente
module.exports.listFourniAtt = (req, res, next) => {
  User.find({ role: 'fournisseur', etat: "en attente" }, (err, docs) => {
    if (!err) { res.send(docs); }
    else { console.log('Error in Retriving users :' + JSON.stringify(err, undefined, 2)); }
  });
}
module.exports.listadmin = (req, res, next) => {
  User.find({ role: 'admin' }, (err, docs) => {
    console.log(docs);
    if (!err) { res.send(docs); }
    else { console.log('Error in Retriving users :' + JSON.stringify(err, undefined, 2)); }
  });
}
module.exports.listclient = (req, res, next) => {
  User.find({ role: 'client' }, (err, docs) => {
    console.log(docs);
    if (!err) { res.send(docs); }
    else { console.log('Error in Retriving users :' + JSON.stringify(err, undefined, 2)); }
  });
}

// module.exports.list1 = (req, res) => {
//   if (!ObjectId.isValid(req.params.id))
//       return res.status(400).send(`No record with given id : ${req.params.id}`);

//   User.findById(req.params.id, (err, doc) => {
//       if (!err) { res.send(doc); }
//       else { console.log('Error in Retriving Employee :' + JSON.stringify(err, undefined, 2)); }
//   });
// }

module.exports.listAdmins = (req, res) => {
  if (!ObjectId.isValid(req.params.society))
    return res.status(400).send(`No record with given id : ${req.params.society}`);

  User.findById(req.params.society, (err, doc) => {
    if (!err) { res.send(doc); }
    else { console.log('Error in Retriving Employee :' + JSON.stringify(err, undefined, 2)); }
  });
}
//update users 
module.exports.update = async (req, res) => {
  const url = req.protocol + "://" + req.get('host');
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`No record with given id : ${req.params.id}`);
  // var user = {
  //   login : req.body.login,
  //   password : req.body.password,
  //   society : req.body.society,
  //   activity : req.body.activity,
  //   phone : req.body.phone,
  //   etat : req.body.etat,
  //   mail : req.body.mail,
  // };
  console.log(req.body);
  if (req.file) {
    req.body.image = url + '/images/' + req.file.filename;
  }
  console.log(req.body.image);
  let user = await User.findById(req.params.id);
  console.log(user);
  if (req.body.password) {
    if (user.password === req.body.password) {
      User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true }, (err, doc) => {
        if (!err) { res.send(doc); }
        else { res.status(400).json({ "message": "erreur updating" }); }
      });
    } else {
      User.findByIdAndUpdate(req.params.id, { $set: req.body, password: bcrypt.hashSync(req.body.password, 10) }, { new: true, runValidators: true }, (err, doc) => {
        if (!err) { res.send(doc); }
        else { res.status(400).json({ "message": "erreur updating" }); }
      });
    }

  } else {
    user.login = req.body.login;
    user.password = req.body.password;
    user.society = req.body.society;
    user.activity = req.body.activity;
    user.phone = req.body.phone;
    user.mail = req.body.mail;
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.adress = req.body.adress;
    user.image = req.body.image;
    User.findByIdAndUpdate(req.params.id, { $set: user }, { new: true }, (err, doc) => {
      if (!err) { res.send(doc); }
      else { res.status(400).json({ "message": err }); }
    });
  }
}

module.exports.updateProfile = (req, res) => {
  if (!ObjectId.isValid(req._id))
    return res.status(400).send(`No record with given id : ${req._id}`);
  User.findByIdAndUpdate(req._id, { $set: req.body }, { new: true }, (err, doc) => {
    if (!err) { res.send(doc); }
    else { console.log('Error in User Update :' + JSON.stringify(err, undefined, 2)); }
  });
}

//delete users
module.exports.delete = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`No record with given id : ${req.params.id}`);
  let user = await User.findById(req.params.id);
  if (user.role == 'fournisseur') {
    Package.deleteMany({ fournisseur: req.params.id }).then(x => {
      User.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) { res.send(doc); }
        else { console.log('Error in Employee Delete :' + JSON.stringify(err, undefined, 2)); }
      });
    });

  } else {
    User.findByIdAndRemove(req.params.id, (err, doc) => {
      if (!err) { res.send(doc); }
      else { console.log('Error in Employee Delete :' + JSON.stringify(err, undefined, 2)); }
    });
  }
}




