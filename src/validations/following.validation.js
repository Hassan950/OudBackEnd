const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const { arrayIds, capitalize } = require('./custom.validation');

exports.checkFollowings = {
  query: Joi.object().keys({
    type: Joi.string()
      .insensitive()
      .lowercase()
      .trim()
      .custom(capitalize)
      .valid('Artist', 'User')
      .required(),
    ids: Joi.custom(arrayIds(50)).required()
  })
};

exports.checkFollowingsPlaylist = {
  query: Joi.object().keys({
    playlistId: Joi.objectId().required(),
    ids: Joi.custom(arrayIds(5)).required()
  })
};
