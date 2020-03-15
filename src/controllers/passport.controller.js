const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');
const { userService } = require('../services');

passport.use('facebook-token', new FacebookTokenStrategy({
  clientID: '3359308630752975',
  clientSecret: '0206e419aab94a2476aacbadbde157e5',
  profileFields: ['id', 'displayName', 'email', 'birthday', 'gender']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const existingUser = await userService.getUser({ "facebook_id": profile.id });
    if (existingUser) {
      return done(null, existingUser);
    }

    const newUser = {
      facebook_id: profile.id,
      email: profile.emails[0].value,
      gender: (profile.gender === 'male') ? 'F' : 'M',
      displayName: profile.displayName,
      images: [profile.photos[0].value],
      birthDate: new Date(profile._json.birthday),
    };

    done(null, newUser);
  } catch (error) {
    done(error, false, error.message);
  }
}));