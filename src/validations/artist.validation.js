const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const { idsArray } = require('./custom.validation');


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
