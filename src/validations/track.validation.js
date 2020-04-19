const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const { idsArray } = require('./custom.validation');


/**
 * Schema that checks that the request is valid for severalTracks endpoint
 *
 * @author Mohamed Abo-Bakr
 * @summary Schema for a req for severalTracks endpoint
 * @namespace
 * @property {object} query An object containing the URL query parameters
 * @property {string} query.ids List of ids in a string (comma separated)
 */
exports.getSeveral = {
  query: Joi.object().keys({
    ids: Joi.string()
      .custom(idsArray(50))
      .required()
  })
};

/**
 * Schema that checks that the request is valid for endpoints that requires one track
 *
 * @author Mohamed Abo-Bakr
 * @summary Schema for a req for an endpoint that requires one track
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the track
 */
exports.oneTrack = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  })
};

/**
 * Schema that checks that the request is valid for updateTrack endpoint
 *
 * @author Mohamed Abo-Bakr
 * @summary Schema for a req for updateTrack endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the track
 * @property {object} body An object that holds parameters that are sent up from the client in the post request
 * @property {string} body.name Name of the track 
 * @property {string[]} body.artists list of ID's of artists of the track
 */
exports.update = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  }),
  body: Joi.object()
    .keys({
      name: Joi.string()
        .min(1)
        .max(30)
        .trim(),
      artists: Joi.array()
        .items(Joi.objectId())
        .min(1)
    })
    .min(1)
};
