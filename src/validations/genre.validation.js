const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const { albumIds } = require('./custom.validation');
const { Genre } = require('../models');


/**
 * Schema that checks that the request is valid for endpoints that requires one genre
 *
 * @author Mohamed Abo-Bakr
 * @summary Schema for a req for an endpoint that requires one genre
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the genre
 */
exports.oneGenre = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  })
};

/**
 * Schema that checks that the request is valid for getGenres endpoint
 *
 * @author Mohamed Abo-Bakr
 * @summary Schema for a req for getGenres endpoint
 * @namespace
 * @property {object} query An object containing the URL query parameters
 * @property {number} query.limit Maximum number of elements in the response
 * @property {number} query.offset index of the first element to return
 */
exports.several = {
  query: Joi.object().keys({
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(50),
    offset: Joi.number().default(0)
  })
};
