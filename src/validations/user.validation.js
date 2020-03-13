const Joi = require('@hapi/joi');
const moment = require('moment');
const validator = require('validator');

const ageCheck = (value, helpers) => {
  const age = moment().diff(value, 'years');
  if (age < 10) {
    return helpers.message('You must be at least 10 years old');
  }
  return value;
};

const countryCheck = (value, helpers) => {
  if (!validator.isISO31661Alpha2(value)) {
    return helpers.message('Invalid Country');
  }
  return value;
};

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
    gender: Joi.string()
      .valid('M', 'F'),
    displayName: Joi.string()
      .trim()
      .required()
  })
};
