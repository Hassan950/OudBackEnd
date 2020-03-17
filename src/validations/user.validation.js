const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi)
const { ageCheck, countryCheck } = require('./custom.validation');

exports.getUser = {
  params: Joi.object().keys({
    userId: Joi.objectId()
  })
}

exports.editProfile = {
  body: Joi.object().keys({
    email: Joi.string()
      .trim()
      .required()
      .email(),
    passwordConfirm: Joi.string()
      .trim()
      .required(),
    dateOfBirth: Joi.string()
      .trim()
      .isoDate()
      .custom(ageCheck),
    country: Joi.string()
      .trim()
      .required()
      .custom(countryCheck),
    gender: Joi.string().valid('M', 'F'),
    displayName: Joi.string()
      .trim()
      .required()
  })
};
