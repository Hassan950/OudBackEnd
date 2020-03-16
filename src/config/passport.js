const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');
const config = require('config');
const { passportController } = require('../controllers');

passport.use('facebook-token', new FacebookTokenStrategy({
  clientID: config.get('FBclientID'),
  clientSecret: config.get('FBclientSecret'),
  profileFields: ['id', 'displayName', 'email', 'birthday', 'gender'],
  passReqToCallback: true
}, passportController.facebookPassport));