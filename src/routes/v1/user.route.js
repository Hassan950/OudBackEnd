const express = require('express');
const { authController } = require('../../controllers');
const validate = require('../../middlewares/validate');
const { authValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');

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

router
  .route('/resetPassword/:token')
  .patch(validate(authValidation.resetPassword), catchAsync(authController.resetPassword));

router
  .route('/verify/:token')
  .patch(validate(authValidation.resetPassword), catchAsync(authController.verify));

module.exports = router;
