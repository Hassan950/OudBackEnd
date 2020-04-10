const Joi = require('@hapi/joi');
Joi.objectId = require("joi-objectid")(Joi);



/**
 * Schema that checks that the request is valid for getPlaylist endpoint
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for getPlaylist endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the playlist
 */

exports.getPlaylist = {
  params: Joi.object().keys({
    id: Joi.objectId()
  })
};

/**
 * Schema that checks that the request is valid for changePlaylist endpoint
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for changePlaylist endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the playlist
 * @property {object} body An object that holds parameters that are sent up from the client in the request
 * @property {string} body.name name of the playlist
 * @property {boolean} query.public public of playlist
 * @property {boolean} query.collabrative collabrative of playlist
 * @property {string} query.description description of playlist
 */

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

/**
 * Schema that checks that the request is valid for uploadImage endpoint
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for uploadImage endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the playlist
 */

exports.uploadImage = {
  params: Joi.object().keys({
    id: Joi.objectId()
  })
};

/**
 * Schema that checks that the request is valid for getImage endpoint
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for getImage endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the playlist
 */


exports.getImage = {
  params: Joi.object().keys({
    id: Joi.objectId()
  })
};


/**
 * Schema that checks that the request is valid for reorderTracks endpoint
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for reorderTracks endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the playlist
 * @property {object} body An object that holds parameters that are sent up from the client in the request
 * @property {number} body.rangeStart the beginning of tracks to be reordered
 * @property {number} query.rangeLength number of tracks after the rangeStart to be reordered
 * @property {number} query.insertBefore the index to put tracks before
 */

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


/**
 * Schema that checks that the request is valid for getTracks endpoint
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for getTracks endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the playlist
 * @property {object} query An object containing the URL query parameters
 * @property {number} query.limit Maximum number of elements in the response
 * @property {number} query.offset index of the first element to return
 */

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


/**
 * Schema that checks that the request is valid for getUserPlaylists endpoint
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for getUserPlaylists endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the user
 * @property {object} query An object containing the URL query parameters
 * @property {number} query.limit Maximum number of elements in the response
 * @property {number} query.offset index of the first element to return
 */

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

/**
 * Schema that checks that the request is valid for deleteTracks endpoint
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for deleteTracks endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the playlist
 * @property {object} query An object containing the URL query parameters
 * @property {array} query.uris array of tracks url to be deleted
 */

exports.deleteTracks = {
  params: Joi.object().keys({
    id: Joi.objectId()
  }),
  body: Joi.object().keys({
    uris: Joi.array().items(Joi.string()).required()
  })
};


/**
 * Schema that checks that the request is valid for createUserPlaylist endpoint
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for createUserPlaylist endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the playlist
 * @property {object} body An object that holds parameters that are sent up from the client in the request
 * @property {string} body.name name of the playlist
 * @property {boolean} query.public public of playlist
 * @property {boolean} query.collabrative collabrative of playlist
 * @property {string} query.description description of playlist
 */

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


/**
 * Schema that checks that the request is valid for replaceTracks endpoint
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for replaceTracks endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the playlist
 * @property {object} query An object containing the URL query parameters
 * @property {array} query.uris array of tracks url to be added instead of tracks inside playlist
 */

exports.replaceTracks = {
  params: Joi.object().keys({
    id: Joi.objectId()
  }),
  body: Joi.object().keys({
    uris: Joi.array().items(Joi.string()).required()
  })
};

/**
 * Schema that checks that the request is valid for addTracks endpoint
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for addTracks endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the playlist
 * @property {object} query An object containing the URL query parameters
 * @property {array} query.uris array of tracks url to be added
 * @property {number} query.position index which the new tracks should be added to
 */

exports.addTracks = {
  params: Joi.object().keys({
    id: Joi.objectId()
  }),
  body: Joi.object().keys({
    uris: Joi.array().items(Joi.string()).required(),
    position: Joi.number().default(0)
  })
};
