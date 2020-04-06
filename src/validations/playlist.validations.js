const Joi = require('@hapi/joi');
Joi.objectId = require("joi-objectid")(Joi);

exports.getPlaylist = {
  params: Joi.object().keys({
    id: Joi.objectId()
  })
};
exports.changePlaylist = {
  params: Joi.object().keys({
    id: Joi.objectId()
  }),
  body: Joi.object().keys({
    name: Joi.string()
      .required()
      .trim()
      .min(3)
      .max(20),
    public: Joi.boolean().default(false),
    collabrative: Joi.boolean().default(false),
    description: Joi.string()
      .trim()
      .min(10)
      .max(25)
      .default('no description for this playlist')
  })
};
exports.uploadImage = {
  params: Joi.object().keys({
    id: Joi.objectId()
  })
};

exports.getImage = {
  params: Joi.object().keys({
    id: Joi.objectId()
  })
};

exports.reorderTracks = {
  params: Joi.object().keys({
    id: Joi.objectId()
  }),
  body: Joi.object().keys({
    rangeStart: Joi.number()
      .required()
      .min(0),
    rangeLength: Joi.number().default(1),
    insertBefore: Joi.number()
      .required()
      .min(0)
  })
};

exports.getTracks = {
  params: Joi.object().keys({
    id: Joi.objectId()
  }),
  query: Joi.object().keys({
    offset: Joi.number().default(0),
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(20)
  })
};

exports.getUserPlaylists = {
  params: Joi.object().keys({
    id: Joi.objectId()
  }),
  query: Joi.object().keys({
    offset: Joi.number().default(0),
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(20)
  })
};

exports.deleteTracks = {
  params: Joi.object().keys({
    id: Joi.objectId()
  }),
  body: Joi.object().keys({
    uris: Joi.array().items(Joi.string()).required()
  })
};

exports.createUserPlaylist = {
  params: Joi.object().keys({
    id: Joi.objectId()
  }),
  body: Joi.object().keys({
    name: Joi.string()
      .required()
      .trim()
      .min(3)
      .max(20),
    public: Joi.boolean().default(false),
    collabrative: Joi.boolean().default(false),
    description: Joi.string()
      .trim()
      .min(10)
      .max(25)
      .default("no description for this playlist"),
    images: Joi.string()
  })
};

exports.replaceTracks = {
  params: Joi.object().keys({
    id: Joi.objectId()
  }),
  body: Joi.object().keys({
    uris: Joi.array().items(Joi.string()).required()
  })
};

exports.addTracks = {
  params: Joi.object().keys({
    id: Joi.objectId()
  }),
  body: Joi.object().keys({
    uris: Joi.array().items(Joi.string()).required(),
    position: Joi.number().default(0)
  })
};
