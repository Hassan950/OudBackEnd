const express = require('express');
const { authController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { authValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');

const router = express.Router();


router
  .route('/updatePassword')
  .patch(catchAsync(authMiddleware.authenticate), validate(authValidation.updatePassword), catchAsync(authController.updatePassword));

router
  .route('/verify')
  .post(catchAsync(authMiddleware.authenticate), catchAsync(authController.requestVerify));

module.exports = router;
