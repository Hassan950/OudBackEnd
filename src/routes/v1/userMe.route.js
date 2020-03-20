const express = require('express');
const { authController, userController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { authValidation, userValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');



const router = express.Router();


router
  .route('/updatePassword')
  .patch(catchAsync(authMiddleware.authenticate), validate(authValidation.updatePassword), catchAsync(authController.updatePassword));

router
  .route('/')
  .get(catchAsync(authMiddleware.authenticate), catchAsync(userController.getProfile));

router
  .route('/profile')
  .put(catchAsync(authMiddleware.authenticate), validate(userValidation.editProfile), catchAsync(userController.editProfile));

router
  .route('/profilePicture')
  .patch(catchAsync(authMiddleware.authenticate), userController.uploadImages, catchAsync(userController.updateImages))

module.exports = router;
