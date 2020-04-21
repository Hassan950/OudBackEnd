const Joi = require('@hapi/joi');
const { idsArray } = require('./custom.validation');


/**
 * Schema that checks that the request is valid for check endpoints
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for check endpoints
 * @namespace
 * @property {object} query An object containing the URL query parameters
 * @property {number} query.ids ids of the tracks or albums to check in endpoints
 */

exports.likedOrNot = {
  query: Joi.object().keys({
    ids: Joi.string()
      .custom(idsArray(50))// to make sure that ids is sent in comma separated way
      .required()//ids is required so it should be sent
  })
};

/**
 * Schema that checks that the request is valid for put endpoints
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for put endpoints
 * @namespace
 * @property {object} query An object containing the URL query parameters
 * @property {number} query.ids ids of the tracks or albums to like in endpoints
 */


exports.likeItems = {
  query: Joi.object().keys({
    ids: Joi.string()
      .custom(idsArray(50))// to make sure that ids is sent in comma separated way
      .required()//ids is required so it should be sent
  })
};

/**
 * Schema that checks that the request is valid for get endpoints
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for get endpoints
 * @namespace
 * @property {object} query An object containing the URL query parameters
 * @property {number} query.limit Maximum number of elements in the response
 * @property {number} query.offset index of the first element to return
 */

exports.getLikedItems = {
  query: Joi.object().keys({
    offset: Joi.number().default(0),//offset should be a number but it is optional so if not sent its default value is zero
    limit: Joi.number()//offset should be a number  (optional)
      .min(1)// if sent its minimum should be 1
      .max(50)// if sent its maximum should be 50
      .default(20)//it is optional so if not sent its default value is zero
  })
};

/**
 * Schema that checks that the request is valid for delete endpoints
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for delete endpoints
 * @namespace
 * @property {object} query An object containing the URL query parameters
 * @property {number} query.ids ids of the tracks or albums to unlike in endpoints
 */

exports.unlikeItems = {
  query: Joi.object().keys({
    ids: Joi.string()// ids should be strings
      .custom(idsArray(50))// to make sure that ids is sent in comma separated way
      .required()//ids is required so it should be sent
  })
};
