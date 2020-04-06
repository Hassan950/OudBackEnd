const express = require('express');
const { tracksController } = require('../../controllers');
const router = express.Router();
const catchAsync = require('../../utils/catchAsync');
const validate = require('../../middlewares/validate');
const { trackValidation } = require('../../validations');
const authMiddleware = require('../../middlewares/auth');

router
  .route('/:id')
  .get(
    validate(trackValidation.oneTrack),
    catchAsync(tracksController.getTrack)
  )
  .delete(
    catchAsync(authMiddleware.authenticate),
    authMiddleware.authorize('artist'),
    validate(trackValidation.oneTrack),
    catchAsync(tracksController.deleteTrack)
  )
  .patch(
    catchAsync(authMiddleware.authenticate),
    authMiddleware.authorize('artist'),
    validate(trackValidation.update),
    catchAsync(tracksController.updateTrack)
  )
  .post(
    catchAsync(authMiddleware.authenticate),
    authMiddleware.authorize('artist'),
    validate(trackValidation.oneTrack),
    tracksController.uploadTrack,
    catchAsync(tracksController.setTrack)
  );

router
  .route('/')
  .get(
    validate(trackValidation.getSeveral),
    catchAsync(tracksController.getTracks)
  );

module.exports = router;
