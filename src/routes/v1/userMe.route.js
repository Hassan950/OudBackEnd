const express = require('express');
const { authController, userController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { authValidation, userValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');
const playerRouter = require('./player.route');
const artistRoute = require('./artist.route');

const router = express.Router();

// all routes need authentication
router.use(catchAsync(authMiddleware.authenticate));

// /me/player router
router.use('/player', playerRouter);

// /me/artist router
router.use('/artists', artistRoute);

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
