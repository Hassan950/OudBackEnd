const express = require('express');
const { playlistController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { playlistValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    validate(playlistValidation.getUserPlaylists),
    catchAsync(playlistController.getUserPlaylists)
  )
  .post(
    catchAsync(authMiddleware.authenticate),
    playlistController.uploadImage,
    validate(playlistValidation.createUserPlaylist),
    catchAsync(playlistController.createUserPlaylist)
  );
router
  .route('/:id')
  .get(
    validate(playlistValidation.getPlaylist),
    catchAsync(playlistController.getPlaylist)
  )
  .put(
    catchAsync(authMiddleware.authenticate),
    playlistController.uploadImage,
    validate(playlistValidation.changePlaylist),
    catchAsync(playlistController.changePlaylist)
  );
router
  .route('/:id/tracks')
  .get(
    validate(playlistValidation.getTracks),
    catchAsync(playlistController.getTracks)
  )
  .post(
    catchAsync(authMiddleware.authenticate),
    validate(playlistValidation.addTracks),
    catchAsync(playlistController.addTracks)
  )
  .put(
    catchAsync(authMiddleware.authenticate),
    validate(playlistValidation.reorderTracks),
    catchAsync(playlistController.reorderTracks)
  )
  .delete(
    catchAsync(authMiddleware.authenticate),
    validate(playlistValidation.deleteTracks),
    catchAsync(playlistController.deleteTracks)
  );
router
  .route('/:id/images')
  .get(
    validate(playlistValidation.getImage),
    catchAsync(playlistController.getImage)
  )
  .put(
    catchAsync(authMiddleware.authenticate),
    playlistController.uploadImage,
    validate(playlistValidation.uploadImage),
    catchAsync(playlistController.uploadImageRoute)
  );
router
  .route('/:id/tracks/Replace')
  .put(
    catchAsync(authMiddleware.authenticate),
    validate(playlistValidation.replaceTracks),
    catchAsync(playlistController.replaceTracks)
  );
module.exports = router;
