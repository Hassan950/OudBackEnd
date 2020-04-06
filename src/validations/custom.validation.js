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

exports.idsArray = maxNum => {
  return function(value, helpers) {
    const values = value.split(',');
    if (values.length > maxNum)
      return helpers.message('too many ids requested');
    try {
      values.forEach(v => {
        if (!mongoose.Types.ObjectId.isValid(v))
          throw helpers.message(v + ' is not a valid Id');
      });
    } catch (err) {
      return err;
    }
    return values;
  };
};

exports.capitalize = (value, helper) => {
  return value.replace(/^./, value[0].toUpperCase());
};
