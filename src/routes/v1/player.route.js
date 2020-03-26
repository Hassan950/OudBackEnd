const express = require('express');
const validate = require('../../middlewares/validate');
const catchAsync = require('../../utils/catchAsync');
const { deviceValidation } = require('../../validations');
const { deviceController, playerController } = require('../../controllers');

const router = express.Router();

router
  .route('/devices')
  .get(catchAsync(deviceController.getUserDevices));

router
  .route('/')
  .get(catchAsync(playerController.getPlayer))
  .put(
    validate(deviceValidation.transferPlayback),
    catchAsync(deviceController.transferPlayback)
  );

router
  .route('/currently-playing')
  .get(catchAsync(playerController.getCurrentlyPlaying));

module.exports = router;
