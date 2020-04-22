const express = require('express');
const { albumsController } = require('../../controllers');
const router = express.Router();
const catchAsync = require('../../utils/catchAsync');
const validate = require('../../middlewares/validate');
const { albumValidation } = require('../../validations');
const authMiddleware = require('../../middlewares/auth');


router
  .route('/:id')
  .get(
    catchAsync(authMiddleware.optionalAuth),
    validate(albumValidation.oneAlbum),
    catchAsync(albumsController.getAlbum)
  )
  .delete(
    catchAsync(authMiddleware.authenticate),
    authMiddleware.authorize('artist'),
    validate(albumValidation.oneAlbum),
    catchAsync(albumsController.findAndDeleteAlbum)
  )
  .patch(
    catchAsync(authMiddleware.authenticate),
    authMiddleware.authorize('artist'),
    validate(albumValidation.updateAlbum),
    catchAsync(albumsController.updateAlbum)
  );

router
  .route('/')
  .get(
    catchAsync(authMiddleware.optionalAuth),
    validate(albumValidation.severalAlbums),
    catchAsync(albumsController.getAlbums)
  )
  .post(
    catchAsync(authMiddleware.authenticate),
    authMiddleware.authorize('artist'),
    validate(albumValidation.createAlbum),
    catchAsync(albumsController.createAlbum)
  );

router
  .route('/:id/tracks')
  .get(
    catchAsync(authMiddleware.optionalAuth),
    validate(albumValidation.albumTracks),
    catchAsync(albumsController.findAlbumTracks)
  )
  .post(
    catchAsync(authMiddleware.authenticate),
    authMiddleware.authorize('artist'),
    validate(albumValidation.createTrack),
    catchAsync(albumsController.newTrack)
  );

router
  .route('/:id/release')
  .patch(
    catchAsync(authMiddleware.authenticate),
    authMiddleware.authorize('artist'),
    validate(albumValidation.release),
    catchAsync(albumsController.releaseAlbum)
  );

router
  .route('/:id/images')
  .post(
    catchAsync(authMiddleware.authenticate),
    authMiddleware.authorize('artist'),
    validate(albumValidation.oneAlbum),
    albumsController.uploadImage,
    catchAsync(albumsController.setImage)
  );

module.exports = router;
