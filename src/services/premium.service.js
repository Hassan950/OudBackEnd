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
  let player = Player.findOneAndUpdate(
    { userId: user._id },
    { $unset: { adsCounter: undefined } }
  ).exec();

  // Update User
  let newUser = Normal.findOneAndUpdate(
    { _id: user._id },
    {
      $inc: { credit: -10 },
      $set: {
        plan: moment(user.plan ? user.plan : undefined).add(30, 'day'),
        role: 'premium'
      }
    },
    { new: true }
  )
    .lean()
    .exec();

  [newUser, player] = await Promise.all([newUser, player]);
  return newUser;
};

/**
 * A method that gift another user a premium subscription
 *
 * @function
 * @author Hassan Mohamed
 * @summary Gift Premium Subscription
 * @param {object} user The user object
 * @param {object} giftedId The gifted user ID
 * @returns {Object} The new user object after updating
 */

exports.gift = async (user, giftedId) => {
  if (user.credit < 10) {
    return new AppError(
      'Your Credit is below the subscription price, Please try redeeming some coupons.',
      httpStatus.BAD_REQUEST
    );
  }

  let giftedUser = await Normal.findById(giftedId, { plan: 1 }).lean();

  if (!giftedUser) {
    return new AppError(
      'There is no normal user associated with this ID',
      httpStatus.NOT_FOUND
    );
  }

  giftedUser = Normal.findOneAndUpdate(
    { _id: giftedId },
    {
      $set: {
        plan: moment(giftedUser.plan ? giftedUser.plan : undefined).add(
          30,
          'day'
        ),
        role: 'premium'
      }
    },
    { new: true }
  )
    .lean()
    .exec();

  let newUser = Normal.findOneAndUpdate(
    { _id: user._id },
    {
      $inc: { credit: -10 }
    },
    { new: true }
  )
    .lean()
    .exec();

  // set player ads to undefined
  let player = Player.findOneAndUpdate(
    { userId: giftedId },
    { $unset: { adsCounter: undefined } }
  ).exec();

  [player, newUser, giftedUser] = await Promise.all([
    player,
    newUser,
    giftedUser
  ]);
  
  return { result: giftedUser, user: newUser};
};
