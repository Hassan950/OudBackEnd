const Joi = require('@hapi/joi');
const { tracksIds } = require('./custom.validation');

exports.check = {
  query: Joi.object().keys({
    ids: Joi.string()
      .custom(tracksIds)
      .required()
  })
};

