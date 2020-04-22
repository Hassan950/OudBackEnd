const Joi = require('@hapi/joi');
Joi.objectId = require("joi-objectid")(Joi);

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

exports.addToRecent = {
  body: Joi.object().keys({
    id: Joi.objectId().required(),
    type: Joi.string().required()
  })
};

exports.getRecent = {
  query: Joi.object().keys({
    offset: Joi.number().default(0),
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(20)
  })
}