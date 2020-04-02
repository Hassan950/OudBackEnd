const express = require('express');
const validate = require('../../middlewares/validate');
const catchAsync = require('../../utils/catchAsync');
const { queueValidation } = require('../../validations');
const { queueController } = require('../../controllers');

const router = express.Router();


router
  .route('/')
  .get(validate(queueValidation), catchAsync(queueController.getQueue));


module.exports = router;