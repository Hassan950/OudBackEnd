const Joi = require('@hapi/joi');
const { idsArray } = require('./custom.validation');

exports.check = {
  query: Joi.object().keys({
    ids: Joi.string()
      .custom(idsArray(50))
      .required()
  })
};

exports.put = {
  query: Joi.object().keys({
    ids: Joi.string()
      .custom(idsArray(50))
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
      .custom(idsArray(50))
      .required()
  })
};
