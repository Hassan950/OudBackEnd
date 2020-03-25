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
    validate(albumValidation.oneAlbum),
    catchAsync(albumsController.getAlbum)
  )
  .delete(
    catchAsync(authMiddleware.authenticate),
    authMiddleware.authorize('artist'),
    validate(albumValidation.oneAlbum),
    catchAsync(albumsController.findAndDeleteAlbum)
  );

router
  .route('/')
  .get(
    validate(albumValidation.severalAlbums),
    catchAsync(albumsController.getAlbums)
  );

router
  .route('/:id/tracks')
  .get(
    validate(albumValidation.albumTracks),
    catchAsync(albumsController.findAlbumTracks)
  );

router
  .route('/:id/release')
  .patch(
    catchAsync(authMiddleware.authenticate),
    authMiddleware.authorize('artist'),
    validate(albumValidation.release),
    catchAsync(albumsController.releaseAlbum)
  );

module.exports = router;
