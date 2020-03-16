const express = require('express');
const { browseController} = require('../../controllers');
const authMiddleware = require('../../middlewares/auth');
const { browseValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync.js');
const validate = require('../../middlewares/validate');

const router = express.Router();

router
  .route('/categories')
  .get(validate(browseValidation.getCategories),catchAsync(browseController.getCategories));
router
  .route('/categories/:id')
  .get(catchAsync(authMiddleware.authenticate),validate(browseValidation.getCategory), catchAsync(browseController.categoryPlaylists));
router
  .route('/categories/:id/playlists')
  //.get(catchAsync(authMiddleware.authenticate),validate(browseValidation.categoryPlaylist),  catchAsync(browseController.categoryPlaylists));
  .get(validate(browseValidation.categoryPlaylist),  catchAsync(browseController.categoryPlaylists));
router
  .route('/new-releases')
  .get(validate(browseValidation.newRelease),catchAsync(browseController.newReleases));
module.exports = router;