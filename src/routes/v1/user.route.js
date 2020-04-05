const express = require('express');
const { authController, userController } = require('../../controllers');
const validate = require('../../middlewares/validate');
const authMiddleware = require('../../middlewares/auth')
const { authValidation, userValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');


const router = express.Router();

router
  .route('/signup')
  .post(validate(authValidation.signup), catchAsync(authController.signup));

router
  .route('/login')
  .post(validate(authValidation.login), catchAsync(authController.login));

router
  .route('/:userId')
  .get(catchAsync(authMiddleware.authenticate), validate(userValidation.getUser), catchAsync(userController.getUser));

router
  .route('/forgotPassword')
  .post(validate(authValidation.forgotPassword), catchAsync(authController.forgotPassword));

router
  .route('/resetPassword/:token')
  .patch(validate(authValidation.resetPassword), catchAsync(authController.resetPassword));

router
  .route('/verify/:token')
  .patch(validate(authValidation.verify), catchAsync(authController.verify));

module.exports = router;
