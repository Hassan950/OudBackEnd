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


exports.idArrayCheck = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value[0]) || value.length != 1) {
    return helpers.message('Invalid id');
  }
  return value;
};

exports.idCheck = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message('Invalid id');
  }
  return value;
};