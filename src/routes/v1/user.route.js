const express = require('express');
const { authController , playlistController} = require('../../controllers');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { authValidation , PlaylistValidation } = require('../../validations');
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
  .route('/:id/playlists')
  .get(catchAsync(authMiddleware.authenticate) ,validate(PlaylistValidation.getUserPlaylists), catchAsync(playlistController.getUserPlaylists))
  .post(catchAsync(authMiddleware.authenticate) ,validate(PlaylistValidation.createUserPlaylist), catchAsync(playlistController.createUserPlaylist));
module.exports = router;
