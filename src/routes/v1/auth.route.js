const express = require('express');
const passport = require('passport');
const catchAsync = require('../../utils/catchAsync');
const { passportController, authController } = require('../../controllers/index');

const router = express.Router();

router
  .route('/facebook')
  .post(passport.authenticate('facebook-token', { session: false }), catchAsync(authController.facebookAuth));

module.exports = router;