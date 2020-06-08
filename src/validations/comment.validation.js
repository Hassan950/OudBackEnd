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


 /**
 * Schema that checks that the request is valid for getComments endpoints
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for check endpoints
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the album or playlist
 * @property {object} query An object containing the URL query parameters
 * @property {number} query.limit Maximum number of elements in the response
 * @property {number} query.offset index of the first element to return
 */
exports.getComments = {
  query: Joi.object().keys({
    offset: Joi.number().default(0),//offset shuld be numberr  and if not passed its default is zero
    limit: Joi.number()// limit should be number its minimum is 1 and maximum is 50 and if not passed its default is 20
      .min(1)
      .max(50)
      .default(20)
  }),
  params: Joi.object().keys({
    id: Joi.objectId()// id shoild be an objectId
  })
};

/**
 * Schema that checks that the request is valid for makeComments endpoints
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for check endpoints
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the album or playlist
 * @property {object} body An object that holds parameters that are sent up from the client in the request
 * @property {string} body.comment comment written by user 
 */

exports.makeComments = {
  params: Joi.object().keys({
    id: Joi.objectId()// id shoild be an objectId
  }),
  body: Joi.object().keys({
    comment: Joi.string().required()// comment should be string and should be passed
  })
};

