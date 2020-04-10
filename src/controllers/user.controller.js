const { userService } = require('../services');
const AppError = require('../utils/AppError');
const httpStatus = require('http-status');
const multer = require('multer');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `${req.user.displayName}-${req.user._id}-${Date.now()}.${ext}`);
  }
});
const multerFilter = (req, file, cb) => {
  if (file.mimetype.split('/')[1].match(/(png|jpg|jpeg)/)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Not an image! Please upload only images.',
        httpStatus.BAD_REQUEST
      ),
      false
    );
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

/**
 * calls multer to upload multiple images that are in req.body.images and put it in req.files
 *
 * @function
 * @throws AppError 500 Internal Server Error if not authenticated
 * @author Hassan Mohamed
 * @summary A middleware that uses multer to upload multiple images
 */

exports.uploadImages = upload.array('images');


/**
 * A middleware that gets the profile of the user
 *
 * @function
 * @author Hassan Mohamed
 * @summary Get The User Profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 500 Internal Server Error if not authenticated
 */

exports.getProfile = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Please Authenticate first', httpStatus.INTERNAL_SERVER_ERROR));
  }
  res.status(httpStatus.OK).send(req.user);
};

/**
 * A middleware that gets a user's profile
 *
 * @function
 * @author Hassan Mohamed
 * @summary Get a User's Profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if req.params.userId was invalid
 */
exports.getUser = async (req, res, next) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    return next(new AppError('User not found', httpStatus.NOT_FOUND));
  }
  res.status(httpStatus.OK).send(user);
};


/**
 * A middleware that edits the user's profile
 *
 * @function
 * @author Hassan Mohamed
 * @summary Edit the user's profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if req.params.userId was invalid
 * @throws AppError 400 if req.body.passwordConfirm doesn't match the user's password
 */
exports.editProfile = async (req, res, next) => {
  const user = await userService.findUserByIdAndCheckPassword(
    req.user._id,
    req.body.passwordConfirm
  );
  if (!user) {
    return next(new AppError(
      "The password you entered doesn't match your password. Please try again.",
      httpStatus.BAD_REQUEST
      ));
    }
  const profile = await userService.editProfile(req.user, req.body);
  res.status(httpStatus.OK).send(profile);
};


/**
 * A middleware that is called after multer has put images on the server side.
 * Updates the paths of images of the user
 *
 * @function
 * @author Hassan Mohamed
 * @summary Updates the paths of images of the user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateImages = async (req, res, next) => {
  const user = await userService.updateImages(
    req.user,
    req.files.map(file => file.path)
  );
  res.status(httpStatus.OK).send(user);
};
