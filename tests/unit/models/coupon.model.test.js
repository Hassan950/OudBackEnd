const moment = require('moment');
const { Coupon } = require('../../../src/models');

describe('Coupon model', () => {
  let coupon;
  beforeEach(() => {
    coupon = new Coupon({
      value: 10,
      used: true
    });
  });

  describe('Coupon model - value', () => {
    it('should throw error if no value passed', () => {
      const args = [null, undefined];
      args.forEach(a => {
        coupon.value = a;
        const error = coupon.validateSync();
        expect(error.errors['value']).toBeDefined();
      });
    });

    it('should be a number', () => {
      const error = coupon.validateSync();
      expect(error).toBeUndefined();
    });
  });

  describe('Coupon model - used', () => {
    it('should be undefined if no value passed', () => {
      coupon.used = undefined;
      const error = coupon.validateSync();
      expect(error).toBeUndefined();
      expect(coupon.used).toBeUndefined();
    });
  });

  it('should be boolean', () => {
    const error = coupon.validateSync();
    expect(error).toBeUndefined();
  });
});
