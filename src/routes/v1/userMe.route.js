const express = require('express');
const { authController , libraryController , userController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { authValidation, userValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');
const playerRouter = require('./player.route')

const router = express.Router();

router.use('/tracks', libraryController);
router.use('/albums', libraryController);
// all routes need authentication
router.use(catchAsync(authMiddleware.authenticate));

// /me/player router
router.use('/player', playerRouter);


router
  .route('/updatePassword')
  .patch(validate(authValidation.updatePassword), catchAsync(authController.updatePassword));

router
  .route('/verify')
  .post(catchAsync(authController.requestVerify));

router
  .route('/')
  .get(
    catchAsync(userController.getProfile)
  );

router
  .route('/profile')
  .put(
    validate(userValidation.editProfile),
    catchAsync(userController.editProfile)
  );

router
  .route('/profilePicture')
  .patch(
    userController.uploadImages,
    catchAsync(userController.updateImages)
  );

module.exports = router;
