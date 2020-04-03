const express = require('express');
const { playlistController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { PlaylistValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');

const router = express.Router({mergeParams: true});
router.use(catchAsync(authMiddleware.authenticate));

router
  .route('/')
  .get(validate(PlaylistValidation.getUserPlaylists), catchAsync(playlistController.getUserPlaylists))
  .post(playlistController.uploadImage,validate(PlaylistValidation.createUserPlaylist), catchAsync(playlistController.createUserPlaylist));
router
  .route('/:id')
  .get(validate(PlaylistValidation.getPlaylist), catchAsync(playlistController.getPlaylist))
  .put(playlistController.uploadImage, validate(PlaylistValidation.changePlaylist), catchAsync(playlistController.changePlaylist));
router
  .route('/:id/tracks')
  .get(validate(PlaylistValidation.getTracks), catchAsync(playlistController.getTracks))
  .post(validate(PlaylistValidation.addTracks), catchAsync(playlistController.addTracks))
  .put(validate(PlaylistValidation.reorderTracks), catchAsync(playlistController.reorderTracks))
  .delete(validate(PlaylistValidation.deleteTracks), catchAsync(playlistController.deleteTracks));
router
  .route('/:id/images')
  .get(validate(PlaylistValidation.getImage), catchAsync(playlistController.getImageRoute))
  .put(playlistController.uploadImage ,validate(PlaylistValidation.uploadImage), catchAsync(playlistController.uploadImageRoute));
router
  .route('/:id/tracks/Replace')
  .put(validate(PlaylistValidation.replaceTracks), catchAsync(playlistController.replaceTracks));    
module.exports = router;
