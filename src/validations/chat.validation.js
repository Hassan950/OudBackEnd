const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

exports.getThread = {
  query: Joi.object().keys({
    offset: Joi.number().default(0),
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(20)
  }),
  params: Joi.object().keys({
    id: Joi.objectId().required()
  })
};

exports.getChat = {
  query: Joi.object().keys({
    offset: Joi.number().default(0),
    limit: Joi.number()
      .min(1)
      .max(50)
      .default(20)
  })
};

exports.sendMessage = {
  params: Joi.object().keys({
    id: Joi.objectId().required()
  }),
  body: Joi.object().keys({
    message: Joi.string().trim().required()
  })
};

exports.deleteMessage = {
  params: Joi.object().keys({
    id: Joi.objectId().required(),
    messageId: Joi.objectId().required()
  })
};