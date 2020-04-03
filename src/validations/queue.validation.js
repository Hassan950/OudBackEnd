const Joi = require('@hapi/joi');
const { idCheck } = require('./custom.validation');

exports.getQueue = {
  query: Joi.object().keys({
    queueIndex: Joi.number()
      .min(0)
      .max(1)
  })
};

exports.repeat = {
  query: Joi.object().keys({
    state: Joi.string()
      .required()
      .valid('off', 'context', 'track'),
    deviceId: Joi.string()
      .custom(idCheck)
  })
};

exports.editPosition = {
  query: Joi.object().keys({
    queueIndex: Joi.number()
      .min(0)
      .max(1),
    newIndex: Joi.number()
      .required()
      .min(0),
    trackIndex: Joi.number()
      .min(0),
    trackId: Joi.string()
      .custom(idCheck)
  })
};