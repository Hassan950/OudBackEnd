const Joi = require('@hapi/joi');
const { idCheck } = require('./custom.validation');

exports.transferPlayback = {
  body: Joi.object().keys({
    deviceIds: Joi.array()
      .min(1)
      .max(1)
      .required()
      .custom(idCheck),
    play: Joi.boolean()
  })
}