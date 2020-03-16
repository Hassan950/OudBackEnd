const Joi = require('@hapi/joi');
Joi.objectID = require('joi-objectid')(Joi);

exports.getCategories = {
  query: Joi.object().keys({
    offset: Joi.number()
      .default(0),
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(20)
  })
};

exports.getCategory = {
  params: Joi.object().keys({
    id: Joi.objectID()
  })
};

exports.categoryPlaylist = {
  params: Joi.object().keys({
    id: Joi.objectID()
  }),
  query:Joi.object().keys({
    offset: Joi.number()
      .default(0),
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(20)
  })
};

exports.newRelease = {
  query: Joi.object().keys({
    offset: Joi.number()
      .default(0),
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(20)
  })
};
