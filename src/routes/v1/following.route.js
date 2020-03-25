const express = require('express');
const catchAsync = require('../../utils/catchAsync');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { followingController } = require('../../controllers');
const { followingValidation } = require('../../validations');

const router = express.Router();

router.route('/')
  .get(
  catchAsync(authMiddleware.authenticate),
  validate(followingValidation.checkFollowings),
  catchAsync(followingController.checkFollowings)
);

module.exports = router;
