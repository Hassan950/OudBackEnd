const Joi = require('@hapi/joi');

exports.getQueue = {
  query: Joi.object().keys({
    queueIndex: Joi.number()
      .min(0)
      .max(1)
  })
};