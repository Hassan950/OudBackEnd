const express = require('express');
const { browseController} = require('../../controllers');
const authMiddleware = require('../../middlewares/auth');
const catchAsync = require('../../utils/catchAsync.js');

const router = express.Router();

router
  .route('/categories')
  .get(catchAsync(browseController.getCategories));

router
  .route('/categories/:id')
  .get(catchAsync(authMiddleware.authenticate), catchAsync(browseController.categoryPlaylists));
router
  .route('/categories/:id/playlists')
  .get(catchAsync(authMiddleware.authenticate), catchAsync(browseController.categoryPlaylists));
router
  .route('/new-releases')
  .get(catchAsync(browseController.newReleases));

module.exports = router;