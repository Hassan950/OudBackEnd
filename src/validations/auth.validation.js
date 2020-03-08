const Joi = require('@hapi/joi');

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
      .isoDate(),
    country: Joi.string()
      .min(2)
      .max(2),
    gender: Joi.string()
      .valid('M', 'F'),
    displayName: Joi.string()
      .required()
  }),
};
