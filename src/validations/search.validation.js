const Joi = require('@hapi/joi');
Joi.objectId = require("joi-objectid")(Joi);


/**
 * Schema that checks that the request is valid for search endpoint
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for search endpoint
 * @namespace
 * @property {object} query An object containing the URL query parameters
 * @property {string} query.q the typed string by the user to match item's name in database
 * @property {string} query.type the type of  item the user want to search in 
 * @property {number} query.limit Maximum number of elements in the response
 * @property {number} query.offset index of the first element to return
 */
exports.search = {
  query: Joi.object().keys({
    q: Joi.string()//the string to serch with should be string
    .required(),//its required
    type: Joi.string()// type of item should be string and its optional
    .valid('album', 'playlist','track','Artist','User'),//the type should be one of those album . playlist,track.Artist,User
    offset: Joi.number().default(0),//offset should be a number but it is optional so if not sent its default value is zero
    limit: Joi.number()//limit should be a number  (optional)
      .min(1)// if sent its minimum should be 1
      .max(50)// if sent its maximum should be 50
      .default(20)//it is optional so if not sent its default value is zero
  })
};

/**
 * Schema that checks that the request is valid for addToRecent endpoint
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for addToRecent endpoint
 * @namespace
 * @property {object} body An object that holds parameters that are sent up from the client in the request
 * @property {string} body.id the id of the item the user searched for
 * @property {string} body.type the type of the item the user searched for
 */
exports.addToRecent = {
  body: Joi.object().keys({
    id: Joi.objectId().required(),//id should be an objectId and it is required
    type: Joi.string().required()//type should be string and is required
  })
};

/**
 * Schema that checks that the request is valid for getRecent endpoint
 *
 * @author Ahmed Magdy
 * @summary Schema for a req for getRecent endpoint
 * @namespace
 * @property {object} query An object containing the URL query parameters
 * @property {number} query.limit Maximum number of elements in the response
 * @property {number} query.offset index of the first element to return
 */
exports.getRecent = {
  query: Joi.object().keys({
    offset: Joi.number().default(0),//offset should be a number but it is optional so if not sent its default value is zero
    limit: Joi.number()//limit should be a number  (optional)
      .min(1)// if sent its minimum should be 1
      .max(50)// if sent its maximum should be 50
      .default(20)//it is optional so if not sent its default value is zero
  })
}