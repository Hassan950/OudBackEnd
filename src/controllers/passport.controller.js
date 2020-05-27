const { userService } = require('../services');
const AppError = require('../utils/AppError');

/**
 * Facebook Authentication passport
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {Object} req - Express Request object
 * @param {String} accessToken
 * @param {String} refreshToken
 * @param {Object} profile
 * @param {Function} done
 * @summary Facebook Authentication passport
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
      email: profile.emails.length ? profile.emails[0].value : undefined,
      gender: (profile.gender) ? ((profile.gender === 'male') ? 'F' : 'M') : undefined,
      displayName: profile.displayName,
      images: profile.photos.length ? [profile.photos[0].value] : undefined,
      birthDate: profile._json.birthday ? new Date(profile._json.birthday) : undefined,
    };

    done(null, newUser);
  } catch (error) {
    done(error, false, error.message);
  }
};

/**
 * Google Authentication passport
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {Object} req - Express Request object
 * @param {String} accessToken
 * @param {String} refreshToken
 * @param {Object} profile
 * @param {Function} done
 * @summary Google Authentication passport
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
      email: profile.emails.length ? profile.emails[0].value : undefined,
      displayName: profile.displayName,
      images: profile.photos.length ? [profile.photos[0].value] : undefined,
    };

    done(null, newUser);
  } catch (error) {
    done(error, false, error.message);
  }
};