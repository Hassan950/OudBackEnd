const Joi = require('@hapi/joi');
const moment = require('moment');
const validator = require('validator');
const AppError = require('../utils/AppError');

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

exports.signup = {
  body: Joi.object().keys({
    email: Joi.string()
      .required()
      .email(),
    password: Joi.string()
      .required()
      .min(8),
    passwordConfirm: Joi.string()
      .required()
      .min(8),
    username: Joi.string()
      .required()
      .min(5)
      .max(30),
    email: Joi.string()
      .required()
      .email(),
    role: Joi.string()
      .required()
      .valid('free', 'premium', 'artist'),
    birthDate: Joi.string()
      .isoDate()
      .custom(ageCheck),
    country: Joi.string()
      .custom(countryCheck),
    gender: Joi.string()
      .valid('M', 'F'),
    displayName: Joi.string()
      .required()
  })
};

exports.login = {
  body: Joi.object().keys({
    email: Joi.string()
      .required()
      .email(),
    password: Joi.string()
      .required()
      .min(8),
  })
};
