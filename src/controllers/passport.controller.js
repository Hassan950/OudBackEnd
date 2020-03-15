const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');
const { User } = require('../models');

passport.use('facebook-token', new FacebookTokenStrategy({
  clientID: '3359308630752975',
  clientSecret: '0206e419aab94a2476aacbadbde157e5'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('profile', profile);
    console.log('accessToken', accessToken);
    console.log('refreshToken', refreshToken);

    const existingUser = await User.findOne({ "facebook_id": profile.id });
    if (existingUser) {
      return done(null, existingUser);
    }

    const newUser = new User({
      facebook_id: profile.id,
      email: profile.emails[0].value
    });

    await newUser.save();
    done(null, newUser);
  } catch (error) {
    done(error, false, error.message);
  }
}));