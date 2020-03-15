const express = require('express');
const passport = require('passport');
const { passportController, authController } = require('../../controllers/index');

const router = express.Router();

router
  .route('/facebook')
  .post(passport.authenticate('facebook-token', { session: false }), authController.facebookOAuth);

module.exports = router;