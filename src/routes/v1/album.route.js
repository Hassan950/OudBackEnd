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
    catchAsync(albumsController.deleteAlbum)
  );

router
  .route('/')
  .get(
    validate(albumValidation.severalAlbums),
    catchAsync(albumsController.getAlbums)
  );

module.exports = router;
