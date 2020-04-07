const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const catchAsync = require('../../utils/catchAsync');
const { queueValidation } = require('../../validations');
const { queueController } = require('../../controllers');

const router = express.Router();


router
  .route('/')
  .get(validate(queueValidation.getQueue), catchAsync(queueController.getQueue))
  .patch(
    auth.authorize('premium', 'artist'),
    validate(queueValidation.editPosition),
    catchAsync(queueController.editPosition)
  )
  .delete(
    auth.authorize('premium', 'artist'),
    validate(queueValidation.deleteTrack),
    catchAsync(queueController.deleteTrack)
  )
  .post(
    validate(queueValidation.addToQueue),
    catchAsync(queueController.addToQueue)
  )


module.exports = router;