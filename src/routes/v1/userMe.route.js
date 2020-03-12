const express = require('express');
const authController = require('../../controllers/auth.controller.js');
const validate = require('../../middlewares/validate.js');
const authValidation = require('../../validations/auth.validation.js');
const catchAsync = require('../../utils/catchAsync.js');

const router = express.Router();


router
  .route('/updatePassword')
  .patch(catchAsync(authController.authenticate), validate(authValidation.updatePassword), catchAsync(authController.updatePassword));

module.exports = router;