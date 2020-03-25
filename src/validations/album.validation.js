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
