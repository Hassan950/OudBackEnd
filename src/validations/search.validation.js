const Joi = require('@hapi/joi');


exports.search = {
  query: Joi.object().keys({
    q: Joi.string().required(),
    type: Joi.string().valid('album', 'playlist','track','Artist','User'),
    offset: Joi.number().default(0),
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(20)
  })
};