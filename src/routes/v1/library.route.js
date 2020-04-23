const express = require('express');
const { libraryController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { libraryValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(validate(libraryValidation.getLikedItems), catchAsync(libraryController.getLikedItems))
  .put(validate(libraryValidation.likeItems), catchAsync(libraryController.likeItems))
  .delete(validate(libraryValidation.unlikeItems), catchAsync(libraryController.unlikeItems));

router
  .route('/contains')
  .get(validate(libraryValidation.likedOrNot), catchAsync(libraryController.likedOrNot));

module.exports = router;
