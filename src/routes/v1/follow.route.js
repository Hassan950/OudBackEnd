const express = require('express');
const catchAsync = require('../../utils/catchAsync');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { followController } = require('../../controllers');
const { followValidation } = require('../../validations');

const router = express.Router();

router
  .route('/me/following/contains')
  .get(
    catchAsync(authMiddleware.authenticate),
    validate(followValidation.checkFollowings),
    catchAsync(followController.checkFollowings)
  );

router
  .route('/playlists/:playlistId/followers/contains')
  .get(
    catchAsync(authMiddleware.optionalAuth),
    validate(followValidation.checkFollowingsPlaylist),
    catchAsync(followController.checkFollowingsPlaylist)
  );

router
  .route('/me/following')
  .get(
    catchAsync(authMiddleware.authenticate),
    validate(followValidation.getUserFollowed),
    catchAsync(followController.getUserFollowed)
  )
  .put(
    catchAsync(authMiddleware.authenticate),
    validate(followValidation.followUser),
    catchAsync(followController.followUser)
  )
  .delete(
    catchAsync(authMiddleware.authenticate),
    validate(followValidation.followUser),
    catchAsync(followController.unfollowUser)
  );

router
  .route('/me/followers')
  .get(
    catchAsync(authMiddleware.authenticate),
    validate(followValidation.getUserFollowers),
    catchAsync(followController.getUserFollowers)
  );

router
  .route('/playlists/:playlistId/followers')
  .put(
    catchAsync(authMiddleware.authenticate),
    validate(followValidation.followPlaylist),
    catchAsync(followController.followPlaylist)
  )
  .delete(
    catchAsync(authMiddleware.authenticate),
    validate(followValidation.followPlaylist),
    catchAsync(followController.unfollowPlaylist)
  );

module.exports = router;
