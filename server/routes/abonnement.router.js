const abonnements = require('express').Router();
const ctrlAbonnement = require('../controllers/abonnement.controller');
const jwtHelper = require('../config/jwtHelper');


abonnements.post('/:id',jwtHelper.verifyJwtToken,ctrlAbonnement.createAbonnement);
abonnements.get('/singleAbonement/:id',ctrlAbonnement.returnAbonnement);
abonnements.get('/',jwtHelper.verifyJwtToken,jwtHelper.cheackRole(['superadmin','admin','fournisseur','client']),ctrlAbonnement.allAbonnements);
abonnements.put('/:id',ctrlAbonnement.update);
abonnements.get('/nonpaye',jwtHelper.verifyJwtToken,jwtHelper.cheackRole(['superadmin','admin','fournisseur','client']),ctrlAbonnement.allAbonnementsNonPaye);
abonnements.put('/activateService/:id',jwtHelper.verifyJwtToken,ctrlAbonnement.activateService);
abonnements.put('/disactivateService/:id',jwtHelper.verifyJwtToken,ctrlAbonnement.disactivateService);

abonnements.delete('/:id',jwtHelper.verifyJwtToken,ctrlAbonnement.delete);

abonnements.post('/addPackage',jwtHelper.verifyJwtToken,ctrlAbonnement.addPackageToAbonnement);
abonnements.post('/removePackage',jwtHelper.verifyJwtToken,ctrlAbonnement.removePackageFromAbonnement);
abonnements.get('/filter/date',jwtHelper.verifyJwtToken,ctrlAbonnement.filterParDate);
abonnements.get('/clients/:id',jwtHelper.verifyJwtToken,ctrlAbonnement.getAbonnementByClientId);
abonnements.get('/groupement',jwtHelper.verifyJwtToken,ctrlAbonnement.abonnementGrop);
abonnements.get('/packgrop',jwtHelper.verifyJwtToken,ctrlAbonnement.packGrop);



module.exports = abonnements;