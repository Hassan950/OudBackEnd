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

module.exports = router;
