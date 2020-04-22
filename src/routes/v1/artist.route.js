const express = require('express');
const albumRoute = require('./album.route');
const catchAsync = require('../../utils/catchAsync');
const { artistController } = require('../../controllers');
const validate = require('../../middlewares/validate');
const { artistValidation } = require('../../validations');
const authMiddleware = require('../../middlewares/auth');

const router = express.Router();

router.use('/albums', albumRoute);

router
  .route('/:id')
  .get(
    validate(artistValidation.oneArtist),
    catchAsync(artistController.getArtist)
  );

router
  .route('/')
  .get(
    validate(artistValidation.severalArtists),
    catchAsync(artistController.getArtists)
  );

router
  .route('/:id/albums')
  .get(
    validate(artistValidation.artistAlbums),
    catchAsync(artistController.getAlbums)
  );

router
  .route('/:id/top-tracks')
  .get(
    validate(artistValidation.oneArtist),
    catchAsync(artistController.getTracks)
  );

router
  .route('/:id/related-artists')
  .get(
    validate(artistValidation.oneArtist),
    catchAsync(artistController.relatedArtists)
  );

router
  .route('/bio')
  .patch(
    catchAsync(authMiddleware.authenticate),
    authMiddleware.authorize('artist'),
    validate(artistValidation.updateBio),
    catchAsync(artistController.updateArtist)
  );

router
  .route('/top-tracks')
  .patch(
    catchAsync(authMiddleware.authenticate),
    authMiddleware.authorize('artist'),
    validate(artistValidation.updatePopularSongs),
    catchAsync(artistController.updateArtist)
  );

router
  .route('/requests')
  .post(
    validate(artistValidation.artistRequest),
    catchAsync(artistController.artistRequest)
  );

router
  .route('/requests/:id/attachments')
  .post(
    validate(artistValidation.oneArtist),
    artistController.uploadImage,
    catchAsync(artistController.setAttach)
  );

router
  .route('/requests/:id/handle')
  .post(
    validate(artistValidation.requestHandle),
    catchAsync(artistController.handleRequest)
  );

module.exports = router;
