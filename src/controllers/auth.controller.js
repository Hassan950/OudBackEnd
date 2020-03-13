const { userService, authService } = require('../services');
const AppError = require('../utils/AppError');

const createTokenAndSend = (user, res) => {
  const token = authService.generateAuthToken(user._id);
  res.setHeader('x-auth-token', token);
  return res.status(200).json({
    token: token,
    user: user
  });
};

/**
 * @version 1.0.0
 * @throws AppError 400 status
 * @author Abdelrahman Tarek
 * @description takes user details from the user and return user and token with 200 status code
 *  if valid else return error with 400 status code
 * @summary User Registration
 * @todo return 401 if set role to premium without credit or atrtist without request
 */
exports.signup = async (req, res, next) => {
  if (req.body.password != req.body.passwordConfirm) {
    return next(new AppError('Please confirm your password', 400));
  }
  const newUser = await userService.createUser(req.body);
  // TODO
  // Return 401 if role is premium without credit
  // Return 401 if role is artist without request
  // Add device
  // use mail to verify user
  createTokenAndSend(newUser, res);
};

/**
 * @version 1.0.0
 * @throws AppError 400 status
 * @author Abdelrahman Tarek
 * @description takes user email and password from the user and return user and token with 200 status code
 *  if valid else return error with 400 status code
 * @summary User Login
 */
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userService.findUserAndCheckPassword(
    { email: email },
    password
  );
  if (!user) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // TODO
  // Add device
  // Send token as header

  user.password = undefined;
  createTokenAndSend(user, res);
};

/**
 * @version 1.0.0
 * @throws AppError 400 status, AppError 401 status
 * @author Abdelrahman Tarek
 * @description takes currentPassword, Password and passwordConfirm. if currentPassword is wrong return 401 status
 * if password != passwordConfirm return 400
 * @summary User Update Password
 */
exports.updatePassword = async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body;

  if (!req.user) {
    return next(new AppError('PLease Authentcate first', 500));
  }
  // get user with a password
  if (password != passwordConfirm) {
    return next(new AppError('Please confirm your password', 400));
  }

  const user = await userService.findUserByIdAndCheckPassword(
    req.user._id,
    currentPassword
  );
  if (!user) {
    return next(new AppError('Incorrect password!', 401));
  }

  user.password = password;
  user.passwordConfirm = password;

  // TODO
  // Add last change password date

  await user.save();
  createTokenAndSend(user, res);
};
