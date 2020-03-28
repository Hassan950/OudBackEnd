const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const AppError = require('../utils/AppError');
const httpStatus = require('http-status');
const { idsArray, capitalize } = require('./custom.validation');

exports.checkFollowings = {
  query: Joi.object().keys({
    type: Joi.string()
      .insensitive()
      .lowercase()
      .trim()
      .custom(capitalize)
      .valid('Artist', 'User')
      .required(),
    ids: Joi.custom(idsArray(50)).required()
  })
};

exports.checkFollowingsPlaylist = {
  query: Joi.object().keys({
    ids: Joi.custom(idsArray(5)).required()
  }),
  params: Joi.object().keys({
    playlistId: Joi.objectId().required()
  })
};

exports.getUserFollowed = {
  query: Joi.object().keys({
    type: Joi.string()
      .insensitive()
      .lowercase()
      .trim()
      .custom(capitalize)
      .valid('Artist', 'User')
      .required(),
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(50),
    offset: Joi.number()
      .min(0)
      .default(0)
  })
};
