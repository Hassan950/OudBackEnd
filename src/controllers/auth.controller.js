const { userService, authService, emailService } = require('../services');
const AppError = require('../utils/AppError');

/**
 * 
 * @param {User} user 
 * @param {Response} res 
 * @author Abdelrahman Tarek
 */
const createTokenAndSend = (user, res) => {
  user.password = undefined;
  user.passwordConfirm = undefined;
  user.__v = undefined;
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
 * @description takes user verify token and change verify to true if token is valid else return 400 status
 * @summary User Verify
 */
exports.verify = async (req, res, next) => {
  const hashedToken = authService.getHashedToken(req.params.token);

  const user = await userService.getUser({
    verifyToken: hashedToken
  });
  if (!user) return next(new AppError('Token is invalid', 400));

  user.verified = true;
  user.verifyToken = undefined;

  await user.save({ validateBeforeSave: false });
  createTokenAndSend(user, res);
}

/**
 * @version 1.0.0
 * @throws AppError 500 status, AppError 400 status
 * @author Abdelrahman Tarek
 * @summary User Request Verify
 */
exports.requestVerify = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('PLease Authentcate first', 500));
  }
  const user = req.user;

  if (user.verified) {
    return next(new AppError('User is Already verified!', 400));
  }

  const verifyToken = authService.createVerifyToken(user);
  await user.save({ validateBeforeSave: false });

  const verifyURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/verify/${verifyToken}`;

  const message = `Hello ${user.displayName}. Please verify your account. Submit a PATCH request to: ${verifyURL}.`;

  try {
    await emailService.sendEmail({
      email: user.email,
      subject: 'Verify your Oud user',
      message
    });
    user.verifyToken = undefined;
    createTokenAndSend(user, res);
  } catch (error) {
    user.verifyToken = undefined;
    user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
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
  // generate verify token
  const verifyToken = authService.createVerifyToken(newUser);
  await newUser.save({
    validateBeforeSave: false
  });
  // use mail to verify user
  const verifyURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/verify/${verifyToken}`;

  const message = `Hello ${newUser.displayName}. Please verify your account. Submit a PATCH request to: ${verifyURL}.`;

  try {
    await emailService.sendEmail({
      email: newUser.email,
      subject: 'Verify your Oud user',
      message
    });
  } catch (error) {
    newUser.verifyToken = undefined;
    newUser.save({ validateBeforeSave: false });
  }
  newUser.verifyToken = undefined;
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
  await user.save();
  createTokenAndSend(user, res);
};

/**
 * @version 1.0.0
 * @throws AppError 404 status, AppError 401 status, AppError 500 status 
 * @author Abdelrahman Tarek
 * @description takes user email then generate reset token and send it via email to reset your password
 * @summary User forgot password
 */
exports.forgotPassword = async (req, res, next) => {
  const user = await userService.getUser({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user with the given email!', 404));
  }
  // TODOS
  // generate reset token and save user
  const resetToken = authService.createPasswordResetToken(user);
  await user.save({
    validateBeforeSave: false
  });
  // send reset token via email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and
   passwordConfirm to: ${resetURL}.`;

  try {
    await emailService.sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 mins)',
      message
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({
      validateBeforeSave: false
    });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
};


/**
 * @version 1.0.0
 * @throws AppError 400 status 
 * @author Abdelrahman Tarek
 * @summary User reset password
 */
exports.resetPassword = async (req, res, next) => {
  // get user based on token
  const hashedToken = authService.getHashedToken(req.params.token);

  const user = await userService.getUser({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now()
    }
  });
  // if token has not expired, and there is user, set the new password
  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createTokenAndSend(user, res)
};


exports.facebookAuth = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Invalid Token', 400));
  }
  if (req.user._id) {
    createTokenAndSend(req.user, res);
  } else {
    res.status(200).json({
      user: req.user
    });
  }
};

exports.facebookConnect = async (req, res, next) => {
  if (req.body.access_token) {
    // connect case
    return next(); // send to passport facebookOAuth
  } else {
    // disconnect case
    if (!req.user) {
      return next(new AppError('Must Authenticate user', 500));
    }
    // set facebook account to null
    req.user.facebook_id = undefined;
    createTokenAndSend(req.user, res);
  }
}