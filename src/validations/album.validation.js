const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const { albumIds } = require('./custom.validation');

exports.oneAlbum = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  })
};

exports.severalAlbums = {
  query: Joi.object().keys({
    ids: Joi.string()
      .custom(albumIds)
      .required()
  })
};

exports.albumTracks = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  }),
  query: Joi.object().keys({
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(20),
    offset: Joi.number().default(0)
  })
};

exports.release = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  }),
  body: Joi.object().keys({
    released: Joi.boolean().required()
  })
};
