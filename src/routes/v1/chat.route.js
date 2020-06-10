const express = require('express');
const validate = require('../../middlewares/validate');
const { chatValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');
const { chatController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .get(validate(chatValidation.getChat), catchAsync(chatController.getChat));

router
  .route('/:id')
  .get(validate(chatValidation.getThread), catchAsync(chatController.getThread))
  .post(
    validate(chatValidation.sendMessage),
    catchAsync(chatController.sendMessage)
  );

router
  .route('/:id/:messageId')
  .delete(
    validate(chatValidation.deleteMessage),
    catchAsync(chatController.deleteMessage)
  );

module.exports = router;
