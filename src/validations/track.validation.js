const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const customJoi = Joi.extend(Joi => ({
  base: Joi.array(),
  type: 'idArray',
  coerce: (value, state, options) => (value.split ? value.split(',') : value)
}));

exports.getSeveral = {
  query: Joi.object().keys({
    ids: customJoi
      .idArray()
      .items(Joi.objectId())
      .single()
  })
};

exports.oneTrack = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  })
};

exports.validateTrack = function validate(track) {
  const schema = {
    name: Joi.string()
      .min(1)
      .max(30)
      .required(),
    artists: [Joi.objectId().required()],
    album: Joi.objectId().required()
  };
  return Joi.validate(track, schema);
};
