const { Coupon, Normal, Player } = require('../models');
const moment = require('moment');
const AppError = require('../utils/AppError');
const httpStatus = require('http-status');

/**
 * A method that redeems a coupon
 *
 * @function
 * @author Hassan Mohamed
 * @summary Redeem Coupon
 * @param {string} couponId id of the coupon
 * @param {object} user The user object
 * @returns {AppError} If coupon id was invalid or already used
 * @returns {Object} The new user object after updating
 */

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

/**
 * A method that subscribe user for premium
 *
 * @function
 * @author Hassan Mohamed
 * @summary Premium Subscription
 * @param {object} user The user object
 * @returns {Object} The new user object after updating
 */

exports.subscribe = async user => {
  if (user.credit < 10) {
    return new AppError(
      'Your Credit is below the subscription price, Please try redeeming some coupons.',
      httpStatus.BAD_REQUEST
    );
  }

  // set player ads to undefined
  await Player.findOneAndUpdate({ userId: user._id }, { $unset: { adsCounter: undefined } });

  // Update User
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
