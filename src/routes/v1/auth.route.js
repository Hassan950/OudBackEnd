const express = require('express');
const passport = require('passport');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { authValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');
const { passportController, authController } = require('../../controllers/index');

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

module.exports = router;