const express = require('express');
const passport = require('passport');
const passportConf = require('../../config/passport.js');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { authValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');
const { authController } = require('../../controllers');

const router = express.Router();

router
  .route('/facebook')
  .post(validate(authValidation.facebookOAuth), passport.authenticate('facebook-token', { session: false }), catchAsync(authController.facebookAuth))
  .patch(
    catchAsync(auth.authenticate),
    validate(authValidation.facebookConnect),
    authController.facebookConnect,
    passport.authenticate('facebook-token', { session: false }),
    catchAsync(authController.facebookAuth)
  );

router
  .route('/google')
  .post(validate(authValidation.googleOAuth), passport.authenticate('google-token', { session: false }), catchAsync(authController.googleAuth))
  .patch(
    catchAsync(auth.authenticate),
    validate(authValidation.googleConnect),
    authController.googleConnect,
    passport.authenticate('google-token', { session: false }),
    catchAsync(authController.googleAuth)
  );

router
  .route('/github')
  .post(validate(authValidation.githubOAuth), passport.authenticate('github-token', { session: false }), catchAsync(authController.githubAuth))
  .patch(
    catchAsync(auth.authenticate),
    validate(authValidation.githubConnect),
    authController.githubConnect,
    passport.authenticate('github-token', { session: false }),
    catchAsync(authController.githubAuth)
  );

module.exports = router;