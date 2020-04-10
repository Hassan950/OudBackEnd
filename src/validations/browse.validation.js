const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);


/**
 * Schema that checks that the request is valid for getCategories endpoint
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for getCategories endpoint
 * @namespace
 * @property {object} query An object containing the URL query parameters
 * @property {number} query.limit Maximum number of elements in the response
 * @property {number} query.offset index of the first element to return
 */

exports.getCategories = {
  query: Joi.object().keys({
    offset: Joi.number().default(0),
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(20)
  })
};

/**
 * Schema that checks that the request is valid for getCategory endpoints
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for getCategory endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the category
 */

exports.getCategory = {
  params: Joi.object().keys({
    id: Joi.objectId()
  })
};

/**
 * Schema that checks that the request is valid for categoryPlaylists endpoint
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for categoryPlaylists endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the category
 * @property {object} query An object containing the URL query parameters
 * @property {number} query.limit Maximum number of elements in the response
 * @property {number} query.offset index of the first element to return
 */

exports.categoryPlaylist = {
  params: Joi.object().keys({
    id: Joi.objectId()
  }),
  query: Joi.object().keys({
    offset: Joi.number()
      .min(0)
      .default(0),
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(20)
  })
};

/**
 * Schema that checks that the request is valid for newReleases endpoint
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for newReleases endpoint
 * @namespace
 * @property {object} query An object containing the URL query parameters
 * @property {number} query.limit Maximum number of elements in the response
 * @property {number} query.offset index of the first element to return
 */

exports.newRelease = {
  query: Joi.object().keys({
    offset: Joi.number().default(0),
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(20)
  })
};
