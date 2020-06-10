const { premiumService } = require('../../../src/services');
const { Coupon, Normal } = require('../../../src/models');
const moment = require('moment');
const requestMocks = require('../../utils/request.mock');
const mockingoose = require('mockingoose').default;
const httpStatus = require('http-status');

describe('Premium Service', () => {
  let coupon;
  let user;
  beforeEach(() => {
    coupon = new Coupon({
      value: 10
    });
    user = new Normal({
      displayName: 'Hassan',
      role: 'free'
    });
  });
  describe('redeemCoupon', () => {
    it('should return bad request if the coupon is not found', async () => {
      mockingoose(Coupon).toReturn(undefined, 'findOneAndUpdate');
      const result = await premiumService.redeemCoupon(coupon._id, user);
      expect(result.statusCode).toBe(httpStatus.BAD_REQUEST);
    });

    it('should return bad request if coupon is already used', async () => {
      coupon.used = true;
      mockingoose(Coupon).toReturn(coupon, 'findOneAndUpdate');
      const result = await premiumService.redeemCoupon(coupon._id, user);
      expect(result.statusCode).toBe(httpStatus.BAD_REQUEST);
    });

    it('should return bad request if coupon is already used', async () => {
      coupon.used = true;
      mockingoose(Coupon).toReturn(coupon, 'findOneAndUpdate');
      const result = await premiumService.redeemCoupon(coupon._id, user);
      expect(result.statusCode).toBe(httpStatus.BAD_REQUEST);
    });

    it('should return normal user if everything is ok', async () => {
      coupon.used = false;
      mockingoose(Coupon).toReturn(coupon, 'findOneAndUpdate');
      mockingoose(Normal).toReturn(user, 'findOneAndUpdate');
      const result = await premiumService.redeemCoupon(coupon._id, user);
      expect(result).toBe(user);
    });
  });

  describe('subscribe', () => {
    it('should return bad request if the credit is lower than the premium monthly price', async () => {
      const result = await premiumService.subscribe(user);
      expect(result.statusCode).toBe(httpStatus.BAD_REQUEST);
    });

    it('should return the user if everything is ok while plan is undefined', async () => {
      user.credit = 10000;
      mockingoose(Normal).toReturn(user, 'findOneAndUpdate');
      const result = await premiumService.subscribe(user);
      expect(result).toBe(user);
    });

    it('should return the user if everything is ok while plan has a previous value', async () => {
      user.credit = 10000;
      user.plan = moment();
      mockingoose(Normal).toReturn(user, 'findOneAndUpdate');
      const result = await premiumService.subscribe(user);
      expect(result).toBe(user);
    });
  });

  describe('gift', () => {
    it('should return bad request if the credit is lower than the premium monthly price', async () => {
      const result = await premiumService.gift(user, user._id);
      expect(result.statusCode).toBe(httpStatus.BAD_REQUEST);
    });

    it('should return the user if everything is ok while plan is undefined', async () => {
      user.credit = 10000;
      mockingoose(Normal).toReturn(user, 'findOneAndUpdate')
        .toReturn(user, 'findOne');
      const { result } = await premiumService.gift(user, user._id);
      expect(result).toBe(user);
    });

    it('should return an error if the user is not found in normal users', async () => {
      user.credit = 10000;
      mockingoose(Normal).toReturn(undefined, 'findOne');
      const result = await premiumService.gift(user, user._id);
      expect(result.statusCode).toBe(httpStatus.NOT_FOUND);
    });

    it('should return the user if everything is ok while plan has a previous value', async () => {
      user.credit = 10000;
      user.plan = moment();
      mockingoose(Normal).toReturn(user, 'findOneAndUpdate')
        .toReturn(user, 'findOne');
      const { result } = await premiumService.gift(user, user._id);
      expect(result).toBe(user);
    });
  });
});
