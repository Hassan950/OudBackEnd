const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const { idsArray } = require('./custom.validation');

exports.oneArtist = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  })
};

exports.severalArtists = {
  query: Joi.object().keys({
    ids: Joi.string()
      .custom(idsArray(50))
      .required()
  })
};

exports.artistAlbums = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  }),
  query: Joi.object().keys({
    limit: Joi.number()
      .default(20)
      .max(50),
    offset: Joi.number().default(0)
  })
};