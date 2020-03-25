const Joi = require('@hapi/joi');
Joi.objectID = require('joi-objectid')(Joi);

exports.getPlaylist = {
  params: Joi.object().keys({
    id: Joi.objectID()
  })
};
exports.changePlaylist = {
  params: Joi.object().keys({
    id: Joi.objectID()
  }),
  body: Joi.object().keys({
    name: Joi.string().required().trim().min(3).max(20),
    public: Joi.boolean().default(false),
    collabrative: Joi.boolean().default(false),
    description: Joi.string().trim().min(10).max(25)
  }) 
};
exports.uploadImage = {
  params: Joi.object().keys({
    id: Joi.objectID()
  }),
  body:Joi.object().keys({
    image: Joi.string()
  })
};

exports.getTracks = {
  params: Joi.object().keys({
    id: Joi.objectID()
  }),
  query: Joi.object().keys({
    offset: Joi.number()
      .default(0),
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(20)
  })
};

exports.getUserPlaylists = {
  params: Joi.object().keys({
    id: Joi.objectID()
  }),
  query: Joi.object().keys({
    offset: Joi.number()
      .default(0),
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(20)
  })
};

exports.deleteTracks = {
  params: Joi.object().keys({
    id: Joi.objectID()
  }),
  body: Joi.object().keys({
    uris: Joi.array().items(Joi.string())
  })
};

exports.createUserPlaylist = {
  params: Joi.object().keys({
    id: Joi.objectID()
  }),
  body: Joi.object().keys({
    name: Joi.string().required().trim().min(3).max(20),
    public: Joi.boolean().default(false),
    collabrative: Joi.boolean().default(false),
    description: Joi.string().trim().min(10).max(25)
  }) 
};

exports.replaceTracks = {
  params: Joi.object().keys({
    id: Joi.objectID()
  }),
  body: Joi.object().keys({
    uris:Joi.array().items(Joi.string()),
  }) 
}

exports.addTracks = {
  params: Joi.object().keys({
    id: Joi.objectID()
  }),
  body: Joi.object().keys({
    uris:Joi.array().items(Joi.string()),
    position: Joi.number()
  }) 
};