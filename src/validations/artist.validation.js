const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const { idsArray, countryCheck } = require('./custom.validation');

/**
 * Schema that checks that the request is valid for endpoints that requires one artist
 *
 * @author Mohamed Abo-Bakr
 * @summary Schema for a req for an endpoint that requires one artist
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the artist
 */
exports.oneArtist = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  })
};

/**
 * Schema that checks that the request is valid for severalArtists endpoint
 *
 * @author Mohamed Abo-Bakr
 * @summary Schema for a req for severalArtists endpoint
 * @namespace
 * @property {object} query An object containing the URL query parameters
 * @property {string} query.ids List of ids in a string (comma separated)
 */
exports.severalArtists = {
  query: Joi.object().keys({
    ids: Joi.string()
      .custom(idsArray(50))
      .required()
  })
};

/**
 * Schema that checks that the request is valid for artistAlbums endpoint
 *
 * @author Mohamed Abo-Bakr
 * @summary Schema for a req for artistAlbums endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the artist
 * @property {object} query An object containing the URL query parameters
 * @property {number} query.limit Maximum number of elements in the response
 * @property {number} query.offset index of the first element to return
 */
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

/**
 * Schema that checks that the request is valid for update bio endpoint
 *
 * @author Mohamed Abo-Bakr
 * @summary Schema for a req for update bio endpoint
 * @namespace
 * @property {object} body An object that holds parameters that are sent up from the client in the body
 * @property {string} body.bio The new bio
 */
exports.updateBio = {
  body: Joi.object().keys({
    bio: Joi.string()
      .min(0)
      .max(255)
      .required()
  })
};

/**
 * Schema that checks that the request is valid for update popular songs endpoint
 *
 * @author Mohamed Abo-Bakr
 * @summary Schema for a req for update popular songs endpoint
 * @namespace
 * @property {object} body An object that holds parameters that are sent up from the client in the post request
 * @property {Array<string>} body.tracks ID's of the tracks
 */
exports.updatePopularSongs = {
  body: Joi.object().keys({
    tracks: Joi.array()
      .items(Joi.objectId())
      .min(1)
      .required()
  })
};

/**
 * Schema that checks that the request is valid for Request to be an artist endpoint
 *
 * @author Mohamed Abo-Bakr
 * @summary Schema for a req for request to be an artist endpoint
 * @namespace
 * @property {object} body An object that holds parameters that are sent up from the client in the post request
 * @property {Array<string>} body.genres ID's of the genres of the artist
 */
exports.artistRequest = {
  body: Joi.object().keys({
    genres: Joi.array()
      .items(Joi.objectId())
      .min(1)
      .required(),
    name: Joi.string()
      .min(5)
      .max(30)
      .required()
      .trim(),
    bio: Joi.string()
      .min(0)
      .max(255),
    email: Joi.string()
      .trim()
      .required()
      .email(),
    displayName: Joi.string()
      .trim()
      .max(30)
      .required(),
    country: Joi.string()
      .trim()
      .required()
      .custom(countryCheck)
  })
};

/**
 * Schema that checks that the request is valid for request handling endpoint
 *
 * @author Mohamed Abo-Bakr
 * @summary Schema that checks that the request is valid for request handling endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the request
 * @property {object} body An object that holds parameters that are sent up from the client in the post request
 * @property {Array<string>} body.accept boolean determining whether we should accept the request or not
 */
exports.requestHandle = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  }),
  body: Joi.object().keys({
    accept: Joi.bool().required()
  })
};
