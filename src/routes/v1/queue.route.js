const express = require('express');
const validate = require('../../middlewares/validate');
const catchAsync = require('../../utils/catchAsync');
const { queueValidation } = require('../../validations');
const { queueController } = require('../../controllers');

const router = express.Router();


router
  .route('/')
  .get(validate(queueValidation.getQueue), catchAsync(queueController.getQueue))
  .patch(validate(queueValidation.editPosition), catchAsync(queueController.editPosition));


module.exports = router;