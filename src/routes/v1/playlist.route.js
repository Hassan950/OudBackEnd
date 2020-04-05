const express = require('express');
const { playlistController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { playlistValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');

const router = express.Router({ mergeParams: true });
//router.use(catchAsync(authMiddleware.authenticate));

router
  .route('/')
  .get(
    validate(playlistValidation.getUserPlaylists),
    catchAsync(playlistController.getUserPlaylists)
  )
  .post(
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
    validate(playlistValidation.addTracks),
    catchAsync(playlistController.addTracks)
  )
  .put(
    validate(playlistValidation.reorderTracks),
    catchAsync(playlistController.reorderTracks)
  )
  .delete(
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
    playlistController.uploadImage,
    validate(playlistValidation.uploadImage),
    catchAsync(playlistController.uploadImageRoute)
  );
router
  .route('/:id/tracks/Replace')
  .put(
    validate(playlistValidation.replaceTracks),
    catchAsync(playlistController.replaceTracks)
  );
module.exports = router;
