const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const { tracksIds } = require('./custom.validation');

exports.oneArtist = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  })
};

exports.severalArtists = {
  query: Joi.object().keys({
    ids: Joi.string()
      .custom(tracksIds)
      .required()
  })
};
