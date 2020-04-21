const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

exports.redeem = {
  body: Joi.object()
    .keys({
      couponId: Joi.objectId().required()
    })
    .messages({
      'string.pattern.name': 'Invalid Coupon Code, Please Check It Before Trying Again.'
    })
};
