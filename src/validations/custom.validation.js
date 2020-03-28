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

exports.urisCheck = (value, helpers) => {
  value.forEach(uri => {
    const arr = uri.split(':');
    if (arr.length != 3) {
      return helpers.message('Invalid uri');
    }

    if (arr[0] != 'oud') {
      return helpers.message('Invalid uri');
    }

    if (arr[1] != 'track') {
      return helpers.message('Invalid uri');
    }
  });

  return value;
};

exports.uriCheck = (value, helpers) => {
  const arr = value.split(':');
  if (arr.length != 3) {
    return helpers.message('Invalid uri');
  }

  if (arr[0] != 'oud') {
    return helpers.message('Invalid uri');
  }

  if (arr[1] != 'track') {
    return helpers.message('Invalid uri');
  }

  if (!mongoose.Types.ObjectId.isValid(arr[2])) {
    return helpers.message('Invalid uri');
  }

  return value;
};

exports.contextUriCheck = (value, helpers) => {
  const arr = value.split(':');
  if (arr.length != 3) {
    return helpers.message('Invalid contextUri');
  }

  if (arr[0] != 'oud') {
    return helpers.message('Invalid contextUri');
  }

  if (arr[1] != 'albums' && arr[1] != 'artists' && arr[1] != 'playlists') {
    return helpers.message('Invalid contextUri');
  }

  if (!mongoose.Types.ObjectId.isValid(arr[2])) {
    return helpers.message('Invalid contextUri');
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
