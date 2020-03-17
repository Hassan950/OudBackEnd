const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const idArray = (value, helper) => {
  const values = value.split(',');
  values.forEach(v => {
    if (!mongoose.Types.ObjectId.isValid(v))
      return helper.message(v + ' is not a valid Id');
  });
  return value;
};

exports.getSeveral = {
  query: Joi.object().keys({
    ids: Joi.string().custom(idArray).required()
  })
};

exports.oneTrack = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  })
};

exports.update = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  }),
  body: Joi.object().keys({
    name: Joi.string().min(1).max(30).trim(),
    artists: Joi.array().items(Joi.objectId())
  }).min(1)
}
// exports.validateTrack = function validate(track) {
//   const schema = {
//     name: Joi.string()
//       .min(1)
//       .max(30)
//       .required(),
//     artists: [Joi.objectId().required()],
//     album: Joi.objectId().required()
//   };
//   return Joi.validate(track, schema);
// };
