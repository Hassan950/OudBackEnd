const { userService } = require('../services');
const AppError = require('../utils/AppError');

/**
 * Facebook passport authentication
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {Object} req - Express request object
 * @param {String} accessToken
 * @param {String} refreshToken
 * @param {Object} profile
 * @param {Function} done 
 * @summary Facebook passport authentication
 */
exports.facebookPassport = async (req, accessToken, refreshToken, profile, done) => {
  try {
    if (req.user) {
      // handle connect case
      if (req.user.facebook_id) {
        // if user sent valid access token and he is connected with facebook
        throw new AppError('User already connected', 400);
      }

      req.user.facebook_id = profile.id;
      return done(null, req.user);
    }

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
};

/**
 * Google passport authentication
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {Object} req - Express request object
 * @param {String} accessToken
 * @param {String} refreshToken
 * @param {Object} profile
 * @param {Function} done 
 * @summary Google passport authentication
 */
exports.googlePassport = async (req, accessToken, refreshToken, profile, done) => {
  try {
    if (req.user) {
      // handle connect case
      if (req.user.google_id) {
        // if user sent valid access token and he is connected with facebook
        throw new AppError('User already connected', 400);
      }

      req.user.google_id = profile.id;
      return done(null, req.user);
    }

    const existingUser = await userService.getUser({ "google_id": profile.id });
    if (existingUser) {
      return done(null, existingUser);
    }

    const newUser = {
      google_id: profile.id,
      email: profile.emails[0].value,
      displayName: profile.displayName,
      images: [profile.photos[0].value],
    };

    done(null, newUser);
  } catch (error) {
    done(error, false, error.message);
  }
};