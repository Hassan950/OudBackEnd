const express = require('express');
const { authController, userController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { authValidation, userValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');
const playerRouter = require('./player.route');
const queueRouter = require('./queue.route');
const artistRoute = require('./artist.route');
const premiumRouter = require('./premium.route');
const playlistRouter = require('./playlist.route');

const router = express.Router();

// all routes need authentication
router.use(catchAsync(authMiddleware.authenticate));

// /me/player router
router.use('/player', playerRouter);
// /me/playlists router
router.use('/playlists', playlistRouter);

// /me/artist router
router.use('/artists', artistRoute);

// /me/queue
router.use('/queue', queueRouter);
// /me
router.use('/', premiumRouter);

router
  .route('/updatePassword')
  .patch(
    validate(authValidation.updatePassword),
    catchAsync(authController.updatePassword)
  );

router.route('/verify').post(catchAsync(authController.requestVerify));

router.route('/').get(catchAsync(userController.getProfile));

router
  .route('/profile')
  .put(
    validate(userValidation.editProfile),
    catchAsync(userController.editProfile)
  );

router
  .route('/profilePicture')
  .patch(userController.uploadImages, catchAsync(userController.updateImages));

module.exports = router;
