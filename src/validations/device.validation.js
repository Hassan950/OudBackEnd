const Joi = require('@hapi/joi');
const { idCheck, idArrayCheck } = require('./custom.validation');

exports.transferPlayback = {
  body: Joi.object().keys({
    deviceIds: Joi.array()
      .min(1)
      .max(1)
      .required()
      .custom(idArrayCheck),
    play: Joi.boolean()
  })
};

exports.deviceIdQuery = {
  query: Joi.object().keys({
    deviceId: Joi.string()
      .custom(idCheck)
  })
};

exports.volume = {
  query: Joi.object().keys({
    deviceId: Joi.string()
      .custom(idCheck),
    volumePercent: Joi.number()
      .required()
      .min(0)
      .max(100)
  })
};