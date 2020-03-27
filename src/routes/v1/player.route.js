const express = require('express');
const validate = require('../../middlewares/validate');
const catchAsync = require('../../utils/catchAsync');
const { deviceValidation, playerValidation } = require('../../validations');
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

router
  .route('/pause')
  .put(
    validate(deviceValidation.deviceIdQuery),
    catchAsync(playerController.pausePlayer)
  );

router
  .route('/play')
  .put(
    validate(playerValidation.play),
    catchAsync(playerController.resumePlayer)
  );

router
  .route('/seek')
  .put(
    validate(playerValidation.seek),
    catchAsync(playerController.seekPlayer)
  );

module.exports = router;
