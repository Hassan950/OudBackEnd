const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const { idsArray } = require('./custom.validation');
const { Artist, Genre } = require('../models');

/**
 * Schema that checks that the request is valid for endpoints that requires one album
 *
 * @author Mohamed Abo-Bakr
 * @summary Schema for a req for an endpoint that requires one album
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the album
 */
exports.oneAlbum = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  })
};

/**
 * Schema that checks that the request is valid for severalAlbums endpoint
 *
 * @author Mohamed Abo-Bakr
 * @summary Schema for a req for severalAlbums endpoint
 * @namespace
 * @property {object} query An object containing the URL query parameters
 * @property {string} query.ids List of ids in a string (comma separated)
 */
exports.severalAlbums = {
  query: Joi.object().keys({
    ids: Joi.string()
      .custom(idsArray(20))
      .required()
  })
};

/**
 * Schema that checks that the request is valid for findAlbumTracks endpoint
 *
 * @author Mohamed Abo-Bakr
 * @summary Schema for a req for findAlbumTracks endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the album
 * @property {object} query An object containing the URL query parameters
 * @property {number} query.limit Maximum number of elements in the response
 * @property {number} query.offset index of the first element to return
 */
exports.albumTracks = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  }),
  query: Joi.object().keys({
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(20),
    offset: Joi.number().default(0)
  })
};

/**
 * Schema that checks that the request is valid for release endpoint
 *
 * @author Mohamed Abo-Bakr
 * @summary Schema for a req for release endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the album
 * @property {object} body An object that holds parameters that are sent up from the client in the body
 * @property {boolean} body.released Boolean value determines the requested operation
 */
exports.release = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  }),
  body: Joi.object().keys({
    released: Joi.boolean()
      .required()
      .valid(true)
  })
};

/**
 * Schema that checks that the request is valid for createAlbum endpoint
 *
 * @author Mohamed Abo-Bakr
 * @summary Schema for a req for createAlbum endpoint
 * @namespace
 * @property {object} body An object that holds parameters that are sent up from the client in the post request
 * @property {string} body.name Name of the album 
 * @property {string[]} body.artists list of ID's of artists of the album
 * @property {string[]} body.genres list of ID's of the genres of the album
 * @property {string} body.album_type type of the album (one of "album", "single", "compilation")
 * @property {string} body.album_group type of the album (only difference from the album_type is that it shows the relation to the artist)
 * @property {date} body.release_date the date the album was released originally
 */
exports.createAlbum = {
  body: Joi.object().keys({
    name: Joi.string()
      .min(1)
      .max(30)
      .required()
      .trim(),
    artists: Joi.array()
      .items(Joi.objectId())
      .min(1)
      .required(),
    genres: Joi.array()
      .items(Joi.objectId())
      .min(1)
      .required(),
    album_type: Joi.string()
      .valid('single', 'compilation', 'album')
      .required(),
    album_group: Joi.string()
      .valid('single', 'compilation', 'album', 'appears_on')
      .required(),
    release_date: Joi.string()
      .regex(
        /^([0-2][0-9]|(3)[0-1])(-)(((0)[0-9])|((1)[0-2]))(-)((1)[5-9]\d{2}|(2)(0)[0-1][0-9]|2020)$/
      )
      .message('Date must match the format "DD-MM-YYYY" and valid')
      .required()
  })
};

/**
 * Schema that checks that the request is valid for updateAlbum endpoint
 *
 * @author Mohamed Abo-Bakr
 * @summary Schema for a req for updateAlbum endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the album
 * @property {object} body An object that holds parameters that are sent up from the client in the post request
 * @property {string} body.name Name of the album 
 * @property {string[]} body.artists list of ID's of artists of the album
 * @property {string[]} body.genres list of ID's of the genres of the album
 * @property {string} body.album_type type of the album (one of "album", "single", "compilation")
 * @property {string} body.album_group type of the album (only difference from the album_type is that it shows the relation to the artist)
 * @property {date} body.release_date the date the album was released originally
 */
exports.updateAlbum = {
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
        .min(1),
      genres: Joi.array()
        .items(Joi.objectId())
        .min(1),
      album_type: Joi.string().valid('single', 'compilation', 'album'),
      album_group: Joi.string().valid(
        'single',
        'compilation',
        'album',
        'appears_on'
      ),
      release_date: Joi.string()
        .regex(
          /^([0-2][0-9]|(3)[0-1])(-)(((0)[0-9])|((1)[0-2]))(-)((1)[5-9]\d{2}|(2)(0)[0-1][0-9]|2020)$/
        )
        .message('Date must match the format "DD-MM-YYYY" and valid')
    })
    .min(1)
};

/**
 * Schema that checks that the request is valid for createTrack endpoint
 *
 * @author Mohamed Abo-Bakr
 * @summary Schema for a req for createTrack endpoint
 * @namespace
 * @property {object} params An object containing parameter values parsed from the URL path
 * @property {string} params.id Id of the album
 * @property {object} body An object that holds parameters that are sent up from the client in the post request
 * @property {string} body.name Name of the track 
 * @property {string[]} body.artists list of ID's of artists of the track
 */
exports.createTrack = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  }),
  body: Joi.object().keys({
    name: Joi.string()
      .min(1)
      .max(30)
      .trim()
      .required(),
    artists: Joi.array()
      .items(Joi.objectId())
      .min(1)
      .required()
  })
};
