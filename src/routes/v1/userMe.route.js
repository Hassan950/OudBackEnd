const express = require('express');
const { authController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { authValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');
const playerRouter = require('./player.route')

const router = express.Router();

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

module.exports = router;
