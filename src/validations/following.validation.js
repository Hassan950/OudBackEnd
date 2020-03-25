const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const { followingsIds, capitalize } = require('./custom.validation');

exports.checkFollowings = {
  query: Joi.object().keys({
    type: Joi.string()
      .insensitive()
      .lowercase()
      .trim()
      .custom(capitalize)
      .valid('Artist', 'User')
      .required(),
    ids: Joi.custom(followingsIds).required()
  })
};
