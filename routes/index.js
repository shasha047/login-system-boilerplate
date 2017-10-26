var express = require('express');
var router = express.Router();

var ctrlUsers = require('../controllers/users.controllers.js');
var ctrlTest = require('../controllers/test.controllers.js');

router
.route('/users/register')
.post(ctrlUsers.register);

router
  .route('/users/login')
  .post(ctrlUsers.login);

router
  .route('/users/logout')
  .get(ctrlUsers.logout);

router
  .route('/users/verifyotp')
  .get(ctrlUsers.verifyotp);  

router
  .route('/test/session') 
  .get(ctrlTest.verifysession);

module.exports = router;