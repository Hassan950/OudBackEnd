const moment = require('moment');
const validator = require('validator');
const mongoose = require('mongoose');

exports.ageCheck = (value, helpers) => {
  const age = moment().diff(value, 'years');
  if (age < 10) {
    return helpers.message('You must be at least 10 years old');
  }
  return value;
};

exports.countryCheck = (value, helpers) => {
  if (!validator.isISO31661Alpha2(value)) {
    return helpers.message('Invalid Country');
  }
  return value;
};

exports.tracksIds = (value, helper) => {
  const values = value.split(',');
  if (values.length > 50) return helper.message('too many ids requested')
  values.forEach(v => {
    if (!mongoose.Types.ObjectId.isValid(v))
      return helper.message(v + ' is not a valid Id');
  });
  return value;
};
