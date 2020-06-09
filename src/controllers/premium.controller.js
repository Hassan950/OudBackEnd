const { premiumService, emailService } = require('../services');
const logger = require('../config/logger');
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

  const hostURL = req.get('host');

  const message = `Hello, ${result.displayName}<br>
  Your Premium subscription will end on ${result.plan}.<br>
  Until then you will be able to enjoy our premium services.<br>
  Make Sure to Resubscribe to keep the tunes flowing.`;

  emailService
    .sendEmail({
      email: result.email,
      subject: 'Oud Premium Subscription',
      message,
      button: 'ENJOY PREMIUM NOW',
      link: hostURL
    })
    .then()
    .catch(error => {
      const { message, code, response } = error;
      logger.error(`${code} : ${message}: ${response.body.errors[0].message}`);
    });
  res.status(httpStatus.OK).json(result);
};

/**
 * A middleware that is called to gift a subscription to premium
 *
 * @function
 * @author Hassan Mohamed
 * @summary Gift premium plan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.gift = async (req, res, next) => {
  const data = await premiumService.gift(req.user, req.body.userId);
  if (data instanceof AppError) return next(data);
  const { result, user } = data;
  const hostURL = req.get('host');

  const message = `Hello, ${result.displayName}<br>
  A Gift For You From ${req.user.displayName}<br>
  Your Premium subscription will end on ${result.plan}.<br>
  Until then you will be able to enjoy our premium services.<br>
  Make Sure to Resubscribe to keep the tunes flowing.`;

  emailService
    .sendEmail({
      email: result.email,
      subject: 'Oud Premium Subscription',
      message,
      button: 'ENJOY PREMIUM NOW',
      link: hostURL
    })
    .then()
    .catch(error => {
      const { message, code, response } = error;
      logger.error(`${code} : ${message}: ${response.body.errors[0].message}`);
    });
  res.status(httpStatus.OK).json(user);
};
