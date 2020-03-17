const express = require('express');
const { tracksController } = require('../../controllers');
const router = express.Router();
const catchAsync = require('../../utils/catchAsync');
const validate = require('../../middlewares/validate');
const { trackValidation } = require('../../validations');

router
  .route('/:id')
  .get(
    validate(trackValidation.oneTrack),
    catchAsync(tracksController.getTrack)
  )
  .delete(
    validate(trackValidation.oneTrack),
    catchAsync(tracksController.deleteTrack)
  )
  .patch(
    validate(trackValidation.update),
    catchAsync(tracksController.updateTrack)
  );

router
  .route('/')
  .get(
    validate(trackValidation.getSeveral),
    catchAsync(tracksController.getTracks)
  );

module.exports = router;
