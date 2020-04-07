const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const { albumIds } = require('./custom.validation');
const { Genre } = require('../models');

exports.oneGenre = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  })
};

exports.several = {
  query: Joi.object().keys({
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(50),
    offset: Joi.number().default(0)
  })
};
