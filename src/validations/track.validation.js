const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const { tracksIds } = require('./custom.validation');

exports.getSeveral = {
  query: Joi.object().keys({
    ids: Joi.string()
      .custom(tracksIds)
      .required()
  })
};

exports.oneTrack = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  })
};

exports.update = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  }),
  body: Joi.object()
    .keys({
      name: Joi.string()
        .min(1)
        .max(30)
        .trim(),
      artists: Joi.array()
        .items(Joi.objectId())
        .min(1)
    })
    .min(1)
};
