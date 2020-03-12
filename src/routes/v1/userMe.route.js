const express = require('express');
const authController = require('../../controllers/auth.controller.js');
const authMiddleware = require('../../middlewares/auth.js');
const validate = require('../../middlewares/validate.js');
const authValidation = require('../../validations/auth.validation.js');
const catchAsync = require('../../utils/catchAsync.js');

const router = express.Router();


router
  .route('/updatePassword')
  .patch(catchAsync(authMiddleware.authenticate), validate(authValidation.updatePassword), catchAsync(authController.updatePassword));

module.exports = router;