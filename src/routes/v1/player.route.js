const express = require('express');
const validate = require('../../middlewares/validate');
const catchAsync = require('../../utils/catchAsync');
const { deviceController } = require('../../controllers');

const router = express.Router();

router
  .route('/device')
  .get(catchAsync(deviceController.getUserDevices));

module.exports = router;
