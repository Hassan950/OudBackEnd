const Joi = require('@hapi/joi');
const { idCheck, uriCheck, urisCheck, contextUriCheck } = require('./custom.validation');

exports.play = {
  query: Joi.object().keys({
    deviceId: Joi.string()
      .custom(idCheck),
    queueIndex: Joi.number()
      .min(0)
      .max(1)
  }),
  body: Joi.object().keys({
    positionMs: Joi.number()
      .min(0),
    offset: Joi.object().keys({
      position: Joi.number()
        .min(0),
      uri: Joi.string().custom(uriCheck)
    }),
    uris: Joi.array().custom(urisCheck),
    contextUri: Joi.string().custom(contextUriCheck)
  })
};