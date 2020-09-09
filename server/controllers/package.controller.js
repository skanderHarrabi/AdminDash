const mongoose = require('mongoose');
const Package = mongoose.model('Package');
const Service = mongoose.model('Service');
const User = mongoose.model('User');

module.exports.filterParDate = (req,res,next) => {
  Package.find({})
    .select("_id name domaine fournisseur services price date")
    .populate('services','name price description state')
    .sort('-date')
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        packages: docs.map(doc => {
          console.log("doc.services =",doc.services)

          return {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            name : doc.name,
            domaine : doc.domaine,
            fournisseur : doc.fournisseur,
            services : doc.services,
            price : doc.price,
            date : doc.date,
            request: {
              type: "GET",
              url: "http://localhost:3000/packages/" + doc._id
            }
          };
        })
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    })
}
module.exports.filterParDomaine = (req,res,next) => {
  console.log("domaine = ",req.body.domaine);
  Package.find({ 'domaine':req.body.domaine })
    .select("_id name domaine fournisseur service price date")
    .populate('services','name price description state')
    .exec()
    .then(docs => {
      if(!docs){
        return res.status(404).json({
          message : "domaine not found"
        })
      }
      res.status(200).json({
        count: docs.length,
        packages: docs.map(doc => {
        
        return {
          _id: doc._id,
          name : doc.name,
          domaine : doc.domaine,
          fournisseur : doc.fournisseur,
          services : doc.services,
          price : doc.price,
          date : doc.date,
          request: {
            type: "GET",
            url: "http://localhost:3000/packages/" + doc._id
          }
        };
        })
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
}
module.exports.removeServiceFromPackage = (req,res,next) => {
  console.log("service id === ",req.body.serviceId);
  console.log("package id === ",req.body.packageId);
  Package.findById(req.body.packageId) 
    .then(package => {
      const index = package.services.indexOf(req.body.serviceId);
      if (index > -1) {
        package.price -= req.body.price;
        package.services.splice(index, 1);
      }
      else {
        console.log("service not found")
        return res.status(404).json({
          message : "Service not found"
        });
      } 
      console.log("after delete ",package.services);
      res.status(200).json({
        message: "Removed service successfully",
      });
      return package.save() 
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
}
module.exports.addServicesToPackage = (req,res,next) => {
  console.log("service id === ",req.body.serviceId);
  console.log("package id === ",req.body.packageId);
  Package.findById(req.body.packageId) 
      .then(package => {
        console.log(package);
        Service.findById(req.body._id)
          .then(service => {
            if(!service){
              return res.status(404).json({
                message : "Service not found"
              });
            }
            package.services.push(service._id)
            package.price += service.price;
            
            res.status(201).json({
              message: "Added service successfully",
            });
            return package.save()
          })
          
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });     
}


module.exports.createPackage = async (req,res,next) => {
  console.log("fourniiseuuuuuuuur===",req.body.fournisseur)
    /* console.log("service id === ",req.body.serviceId);
    Service.findById(req.body.serviceId)
        .then(service => {
            if(!service) {
                return res.status(404).json({
                    message : "Service not found"
                });
            }
            else {
              console.log("serviceee ",service)
            } */
       // console.log(p);
        //const ress = calculePrice(req.body.services);
        let user = await  User.findOne({login:req.body.fournisseur,role:"fournisseur"});
        console.log(user);
        if(!user){
          return res.status(500).json({
            message:"fournisseur not found !"
          })
        }
        let price = 0;
        let i = 0;
        console.log(user._id);
        //console.log(req.body);
        if(req.body.services.length>0){
            req.body.services.map(async serviceId => {
              await Service.findById(serviceId)
                .then(s => {
                  price += s.price;
                  i++;
                  //console.log("price "+ i +" "+price);
                  if(i==req.body.services.length) {
                    const pack = new Package({
                    _id : new mongoose.Types.ObjectId(),
                    name : req.body.name,
                    domaine : req.body.domaine,
                    fournisseur :user._id,
                    services :req.body.services,
                    price : price,
                    date : new Date()
                    });
                    pack
                            .save()
                            .then(result => {
                                res.status(200).json({
                                    message : "Package created",
                                    createdPackage : {
                                        _id : result._id,
                                        name : result.name,
                                        domaine : result.domaine,
                                        fournisseur :result.fournisseur,
                                        services :result.services,
                                        price : result.price,
                                        date : result.date
                                    },
                                    request: {
                                        type: "GET",
                                        url: "http://localhost:3000/packages/" + result._id
                                      }
                                });
                            })
                            .catch(err => {
                                res.status(500).json({
                                    error : err
                                });
                            });


                  };
                });
            });
          }else {
            const pack = new Package({
              _id : new mongoose.Types.ObjectId(),
              name : req.body.name,
              domaine : req.body.domaine,
              fournisseur :user._id,
              services :req.body.services,
              price : 0,
              date : new Date()
              });
              pack
                      .save()
                      .then(result => {
                          res.status(200).json({
                              message : "Package created",
                              createdPackage : {
                                  _id : result._id,
                                  name : result.name,
                                  domaine : result.domaine,
                                  fournisseur :result.fournisseur,
                                  services :result.services,
                                  price : result.price,
                                  date : result.date
                              },
                              request: {
                                  type: "GET",
                                  url: "http://localhost:3000/packages/" + result._id
                                }
                          });
                      })
                      .catch(err => {
                          res.status(500).json({
                              error : err
                          });
                      });

          }
        //console.log(pack);    
        //})
        
}

module.exports.delete = (req,res,next)=> {
    Package.remove({ _id: req.params.id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Package deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/packages",
          body: { serviceId: "ID", quantity: "Number" }
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
}

module.exports.update = (req,res,next) => {
    const id = req.params.id;
    const obj = {
      name:req.body.name,
      domaine:req.body.domaine,
      price:req.body.price,
      date:req.body.date
    }
    console.log(req.body);
    Package.update({_id:id}, obj, {new: true }, (err, doc) => {
      if (!err) { res.send(doc); }
      else { console.log('Error in User Update :' + JSON.stringify(err, undefined, 2)); }
    });
}
//service eli ynjm yzidhom lfournisseur lil pack
module.exports.servicesCanAdd = (req,res,next) => {
  console.log(req.params.id);
  Package.findById(req.params.id)
    .select("_id name domaine fournisseur services price date")
    .populate('fournisseur','login')
    .then(async package => {
      console.log(package);
      let services
      if(req.role=='fournisseur'){
       services = await Service.find({fournisseurId:req._id});  
      }else {
       services = await Service.find();
      }
      let arraytopass = [];
      console.log(services);
      let i=0;
      services.map( service => {
        i++;
        if( !package.services.includes(service._id)){
          arraytopass.push(service);
        } 
        if(i==services.length) {
          res.send(arraytopass);
        }
      }) 
    })
}

module.exports.allPackages =async (req,res,next) => {
  if(req.role == 'superadmin' || req.role == 'admin'||req.role == 'client'){
      let packages = await Package.find()
      if(packages.length == 0){
        //console.log(packages);
        return res.send(packages);
      }else{
        Package.find()
        .select("_id name domaine fournisseur services price date")
        .populate('services', 'name price description state')
        .populate('fournisseur','firstName')
        .exec()
        .then(docs => {
          i=0;
          packs=[];
          docs.map(async doc => {
            console.log("doc ::",doc)
            doc.fournisseurName = doc.fournisseur.firstName;
            pack={
              _id:doc._id,
              services:doc.services,
              name : doc.name,
              domaine : doc.domaine,
              price:doc.price,
              date:doc.date,
              fournisseur : doc.fournisseur.firstName
            }
            i++;
            console.log(pack);
            packs.push(pack);
            if(i == docs.length) res.send(packs);
          })
          
        })
        .catch(err => {
          res.status(500).json({
            error: err
          });
        });
      }
  }else{
   let packages = await Package.find({fournisseur:req._id})
   if(packages.length == 0){
     //console.log(packages);
    return res.send(packages);
   }else{
    Package.find({fournisseur:req._id})
    .select("_id name domaine fournisseur services price date")
    .populate('services', 'name price description state')
    .populate('fournisseur','firstName')
    .exec()
    .then(docs => {
      i=0;
      packs=[];
      docs.map(async doc => {
         doc.fournisseurName = doc.fournisseur.firstName;
         pack={
           _id:doc._id,
           services:doc.services,
           name : doc.name,
           domaine : doc.domaine,
           price:doc.price,
           date:doc.date,
           fournisseur : doc.fournisseur.firstName
         }
         i++;
         //console.log(pack);
         packs.push(pack);
         if(i == docs.length) res.send(packs);
      })
      
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
   }
  }
}
module.exports.allServiceOfPackage = (req,res,next) => {
  Package.findById(req.params.id).then(async pack=>{
    if(!pack) return res.status(500).json({
      message: "Package not found",
    });
    let services = [];
    let i = 0;
    console.log(pack.services);
    if(pack.services.length == 0) return res.status(200).json({services : services});
    pack.services.map(async ele =>{
      let s = await Service.findById(ele);
      services.push(s);
      i++;
      if(i == pack.services.length){
        res.status(200).json({
          services : services,
        });
      }
    });
    console.log(services);
    
  });
}

module.exports.returnPackage = (req,res,next) => {
    Package.findById(req.params.id)
    .populate('services','name price description state')
    .exec()
    .then(package => {
      if (!package) {
        return res.status(404).json({
          message: "Package not found"
        });
      }
      res.status(200).json({
        request: {
          PackageId : package._id,
          PackageName:package.name,
          Services : package.services,
          price : package.price,
          date : package.date,
          fournisseur : package.fournisseur,
          type: "GET",
          url: "http://localhost:3000/packages"
        }
      });
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      });
    });
}

