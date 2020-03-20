const express = require('express');
const { authController } = require('../../controllers');
const validate = require('../../middlewares/validate');
const { authValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');
const playlistRoute = require('./playlist.route');

const router = express.Router();

router.use('/:id/playlists',playlistRoute );

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
module.exports = router;
