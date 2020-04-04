const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
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
  params: Joi.object().keys({
    playlistId: Joi.objectId().required()
  }),
  query: Joi.object().keys({
    ids: Joi.custom(idsArray(5)).required()
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
  }),
  params: Joi.object().keys({
    userId: Joi.objectId().required()
  })
};

exports.getUserFollowers = {
  query: Joi.object().keys({
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(50),
    offset: Joi.number()
      .min(0)
      .default(0)
  }),
  params: Joi.object().keys({
    userId: Joi.objectId().required()
  })
};

exports.followUser = {
  query: Joi.object().keys({
    type: Joi.string()
      .insensitive()
      .lowercase()
      .trim()
      .custom(capitalize)
      .valid('Artist', 'User')
      .required(),
    ids: Joi.custom(idsArray(50))
  }),
  body: Joi.object().keys({
    ids: Joi.array()
      .items(Joi.objectId())
      .max(50)
  })
};

exports.followPlaylist = {
  params: Joi.object().keys({
    playlistId: Joi.objectId().required()
  }),
  body: Joi.object().keys({
    public: Joi.boolean().default(true)
  })
};
