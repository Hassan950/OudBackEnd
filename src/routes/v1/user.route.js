const express = require('express');
const authController = require('../../controllers/auth.controller.js');
const validate = require('../../middlewares/validate.js');
const authValidation = require('../../validations/auth.validation.js');

const router = express.Router();

router
  .route('/signup')
  .post(validate(authValidation.signup), authController.signup);

module.exports = router;
