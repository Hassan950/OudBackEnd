const express = require('express');
const { commentController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { commentValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    validate(commentValidation.getComments),
    catchAsync(commentController.getComments)
  )
  .post(
    catchAsync(authMiddleware.authenticate),
    validate(commentValidation.makeComments),
    catchAsync(commentController.makeComments)
  );

module.exports = router;
