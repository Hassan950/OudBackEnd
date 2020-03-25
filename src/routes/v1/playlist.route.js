const express = require('express');
const { playlistController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { PlaylistValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');

const router = express.Router({mergeParams: true});

router
  .route('/')
  .get(catchAsync(authMiddleware.authenticate) ,validate(PlaylistValidation.getUserPlaylists), catchAsync(playlistController.getUserPlaylists))
  .post(catchAsync(authMiddleware.authenticate) ,validate(PlaylistValidation.createUserPlaylist), catchAsync(playlistController.createUserPlaylist));


router
  .route('/:id')
  .get(catchAsync(authMiddleware.authenticate), validate(PlaylistValidation.getPlaylist), catchAsync(playlistController.getPlaylist))
  .put(catchAsync(authMiddleware.authenticate), validate(PlaylistValidation.changePlaylist), catchAsync(playlistController.changePlaylist));
router
  .route('/:id/tracks')
  .get(catchAsync(authMiddleware.authenticate), validate(PlaylistValidation.getTracks), catchAsync(playlistController.getTracks))
  .post(catchAsync(authMiddleware.authenticate), validate(PlaylistValidation.addTracks), catchAsync(playlistController.addTracks))
  .put()
  .delete(catchAsync(authMiddleware.authenticate), validate(PlaylistValidation.deleteTracks), catchAsync(playlistController.deleteTracks));
router
  .route('/:id/images')
  .put(catchAsync(authMiddleware.authenticate), validate(PlaylistValidation.uploadImage), catchAsync(playlistController.uploadImage));
router
  .route('/:id/tracks/Replace')
  .put(catchAsync(authMiddleware.authenticate), validate(PlaylistValidation.replaceTracks), catchAsync(playlistController.replaceTracks));    
module.exports = router;
