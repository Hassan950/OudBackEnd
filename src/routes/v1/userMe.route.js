const express = require('express');
const { authController, userController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { authValidation, userValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');
const playerRouter = require('./player.route')
const libraryRouter = require('./library.route');
const queueRouter = require('./queue.route');
const artistRoute = require('./artist.route');
const premiumRouter = require('./premium.route');
const playlistRouter = require('./playlist.route');

const router = express.Router();

// /me/playlists router
router.use('/playlists', playlistRouter);

// /me/artist router
router.use('/artists', artistRoute);

// all routes need authentication
router.use(catchAsync(authMiddleware.authenticate));

// /me/player router
router.use('/player', playerRouter);
router.use('/tracks', libraryRouter);
router.use('/albums', libraryRouter);


// /me/queue
router.use('/queue', queueRouter);


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

// /me
router.use('/', premiumRouter);

module.exports = router;
