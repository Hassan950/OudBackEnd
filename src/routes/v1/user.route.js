const express = require('express');
const authController = require('../../controllers/auth.controller.js');
const validate = require('../../middlewares/validate.js');
const authValidation = require('../../validations/auth.validation.js');
const catchAsync = require('../../utils/catchAsync.js');

const router = express.Router();

router
  .route('/signup')
  .post(validate(authValidation.signup), catchAsync(authController.signup));

router
  .route('/login')
  .post(validate(authValidation.login), catchAsync(authController.login));

router
  .route('/forgotPassword')
  .post(validate(authValidation.forgotPassword), catchAsync(authController.forgotPassword));

module.exports = router;
