const express = require('express');
const validate = require('../../middlewares/validate');
const catchAsync = require('../../utils/catchAsync');
const { deviceValidation, playerValidation, queueValidation } = require('../../validations');
const { deviceController, queueController, playerController, playHistoryController } = require('../../controllers');

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

router
  .route('/volume')
  .put(
    validate(deviceValidation.volume),
    catchAsync(deviceController.setVolume)
  );

router
  .route('/recently-played')
  .get(
    validate(playerValidation.recenltyPlayed),
    catchAsync(playHistoryController.recentlyPlayed)
  );

router
  .route('/repeat')
  .put(
    validate(queueValidation.repeat),
    catchAsync(queueController.repeatQueue)
  )

router
  .route('/shuffle')
  .put(
    validate(queueValidation.shuffle),
    catchAsync(queueController.shuffleQueue)
  );

router
  .route('/next')
  .post(
    validate(queueValidation.deviceId),
    catchAsync(queueController.nextTrack)
  );

router
  .route('/previous')
  .post(
    validate(queueValidation.deviceId),
    catchAsync(queueController.previousTrack)
  );

module.exports = router;
