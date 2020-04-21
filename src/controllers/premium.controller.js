const { premiumService } = require('../services');
const AppError = require('../utils/AppError');
const httpStatus = require('http-status');

/**
 * A middleware that is called to redeem a coupon and set it as a used and add its value to user's credit
 *
 * @function
 * @author Hassan Mohamed
 * @summary Redeem a coupon code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.redeem = async (req, res, next) => {
  const result = await premiumService.redeemCoupon(req.body.couponId, req.user);
  if (result instanceof AppError) return next(result);
  res.status(httpStatus.OK).json(result);
};

/**
 * A middleware that is called to subscribe to premium
 *
 * @function
 * @author Hassan Mohamed
 * @summary Subscribe to premium plan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.subscribe = async (req, res, next) => {
  const result = await premiumService.subscribe(req.user);
  if (result instanceof AppError) return next(result);
  res.status(httpStatus.OK).json(result);
};
