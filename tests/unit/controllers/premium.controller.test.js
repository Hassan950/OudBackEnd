const { premiumController } = require('../../../src/controllers');
const { premiumService } = require('../../../src/services');
const AppError = require('../../../src/utils/AppError');
const requestMocks = require('../../utils/request.mock');
const httpStatus = require('http-status');

describe('Premium Controller', () => {
  let req;
  let res;
  let next;
  let json;
  beforeEach(() => {
    req = { params: {}, query: {}, body: {}, get: jest.fn().mockReturnThis() };
    res = requestMocks.mockResponse();
    json = jest.fn();
    res.status = jest.fn().mockReturnValue({
      json: json
    });
    next = jest.fn();
  });
  describe('redeem', () => {
    it('should return an error if premiumService has returned an AppError instance', async () => {
      req.user = { role: 'free' };
      premiumService.redeemCoupon = jest
        .fn()
        .mockResolvedValue(new AppError('An Error', httpStatus.BAD_REQUEST));
      await premiumController.redeem(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.BAD_REQUEST);
    });

    it('should send json file if everything went ok', async () => {
      req.user = { role: 'free' };
      const result = 'someReturnValue';
      premiumService.redeemCoupon = jest.fn().mockResolvedValue(result);
      await premiumController.redeem(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
      expect(json.mock.calls[0][0]).toBe(result);
    });
  });

  describe('subscribe', () => {
    it('should return an error if premiumService has returned an AppError instance', async () => {
      req.user = { role: 'free' };
      premiumService.subscribe = jest
        .fn()
        .mockResolvedValue(new AppError('An Error', httpStatus.BAD_REQUEST));
      await premiumController.subscribe(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.BAD_REQUEST);
    });

    it('should send json file if everything went ok', async () => {
      req.user = { role: 'free' };
      const result = 'someReturnValue';
      premiumService.subscribe = jest.fn().mockResolvedValue(result);
      await premiumController.subscribe(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
      expect(json.mock.calls[0][0]).toBe(result);
    });
  });

  describe('gift', () => {
    it('should return an error if premiumService has returned an AppError instance', async () => {
      req.user = { role: 'free' };
      req.body.userId = "validId";
      premiumService.gift = jest
        .fn()
        .mockResolvedValue(new AppError('An Error', httpStatus.BAD_REQUEST));
      await premiumController.gift(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.BAD_REQUEST);
    });

    it('should send json file if everything went ok', async () => {
      req.user = { role: 'free' };
      req.body.userId = "validId";
      const result = 'someReturnValue';
      premiumService.gift = jest.fn().mockResolvedValue(result);
      await premiumController.gift(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
      expect(json.mock.calls[0][0]).toBe(result);
    });
  });
});
