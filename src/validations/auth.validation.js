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

exports.signup = {
  body: Joi.object().keys({
    email: Joi.string()
      .required()
      .email(),
    password: Joi.string()
      .required()
      .min(8),
    passwordConfirm: Joi.string()
      .required(),
    username: Joi.string()
      .required()
      .min(5)
      .max(30),
    role: Joi.string()
      .default('free')
      .valid('free', 'premium', 'artist'),
    birthDate: Joi.string()
      .isoDate()
      .custom(ageCheck),
    country: Joi.string()
      .required()
      .custom(countryCheck),
    gender: Joi.string()
      .valid('M', 'F'),
    displayName: Joi.string()
      .required(),
    facebook_id: Joi.string(),
    google_id: Joi.string()
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

exports.updatePassword = {
  body: Joi.object().keys({
    currentPassword: Joi.string()
      .required()
      .min(8),
    password: Joi.string()
      .required()
      .min(8),
    passwordConfirm: Joi.string()
      .required()
  })
};

exports.forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string()
      .required()
      .email()
  })
};


exports.resetPassword = {
  body: Joi.object().keys({
    password: Joi.string()
      .required()
      .min(8),
    passwordConfirm: Joi.string()
      .required()
  }),
  params: Joi.object().keys({
    token: Joi.string()
      .required()
      .min(8)
  })
};

exports.verify = {
  params: Joi.object().keys({
    token: Joi.string()
      .required()
      .min(8)
  })
};

exports.facebookOAuth = {
  body: Joi.object().keys({
    access_token: Joi.string()
      .required()
  })
};

exports.facebookConnect = {
  body: Joi.object().keys({
    access_token: Joi.string()
  })
};

