const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');
const GooglePlusTokenStrategy = require('passport-google-plus-token');
const config = require('config');
const { passportController } = require('../controllers');

passport.use('facebook-token', new FacebookTokenStrategy({
  clientID: config.get('FBClientID'),
  clientSecret: config.get('FBClientSecret'),
  profileFields: ['id', 'displayName', 'email', 'birthday', 'gender'],
  passReqToCallback: true
}, passportController.facebookPassport));

passport.use('google-token', new GooglePlusTokenStrategy({
  clientID: config.get('GoogleClientID'),
  clientSecret: config.get('GoogleClientSecret'),
  passReqToCallback: true
}, passportController.googlePassport));