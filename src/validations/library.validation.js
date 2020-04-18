const Joi = require('@hapi/joi');
const { tracksIds } = require('./custom.validation');

exports.check = {
  query: Joi.object().keys({
    ids: Joi.string()
      .custom(tracksIds)
      .required()
  })
};

exports.put = {
  query: Joi.object().keys({
    ids: Joi.string()
      .custom(tracksIds)
      .required()
  })
};

exports.get = {
  query: Joi.object().keys({
    offset: Joi.number().default(0),
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(20)
  })
};

exports.delete = {
  query: Joi.object().keys({
    ids: Joi.string()
      .custom(tracksIds)
      .required()
  })
};
