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
    cb(new AppError('Not an image! Please upload only images.', httpStatus.BAD_REQUEST), false)
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadImages = upload.array('images');

exports.getProfile = async (req, res) => {
  res.status(httpStatus.OK).send(req.user);
};

exports.getUser = async (req, res) => {
  const user = await userService
    .getUserById(req.params.userId)
    .populate('artist');
  res.status(httpStatus.OK).send(user);
};

exports.editProfile = async (req, res) => {
  const user = userService.findUserByIdAndCheckPassword(
    req.user._id,
    req.body.passwordConfirm
  );
  if (!user) {
    throw new AppError(
      "The password you entered doesn't match your password. Please try again.",
      httpStatus.BAD_REQUEST
    );
  }
  const profile = await userService.editProfile(
    req.user._id,
    req.body
  );
  res.status(httpStatus.OK).send(profile);
};

exports.updateImages = async (req, res) => {
  const user = await userService.updateImages(req.user._id, req.files.map(file => file.path))
  res.status(httpStatus.OK).send(user);
}
