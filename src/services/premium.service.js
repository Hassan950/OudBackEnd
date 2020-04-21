const { Coupon, Normal } = require('../models');
const moment = require('moment');
const AppError = require('../utils/AppError');
const httpStatus = require('http-status');


exports.redeemCoupon = async (couponId, user) => {
  const coupon = await Coupon.findOneAndUpdate(
    { _id: couponId },
    { $set: { used: true } },
    { new: false }
  ).lean();
  if (!coupon) {
    return new AppError(
      'Invalid Coupon Code, Please Check It Before Trying Again.',
      httpStatus.BAD_REQUEST
    );
  }
  if (coupon.used) {
    return new AppError('Coupon is already used.', httpStatus.BAD_REQUEST);
  }
  return await Normal.findByIdAndUpdate(
    user._id,
    {
      $inc: { credit: coupon.value }
    },
    { new: true }
  );
};

exports.subscribe = async user => {
  if (user.credit < 10) {
    return new AppError(
      'Your Credit is below the subscription price, Please try redeeming some coupons.',
      httpStatus.BAD_REQUEST
    );
  }
  return await Normal.findOneAndUpdate(
    { _id: user._id },
    {
      $inc: { credit: -10 },
      $set: {
        plan: moment(user.plan ? user.plan : undefined)
          .add(30, 'day'),
        role: 'premium'
      }
    },
    { new: true }
  ).lean();
};
