const deviceMocks = require('../../utils/models/device.model.mocks');
const userMocks = require('../../utils/models/user.model.mocks');
const requestMocks = require('../../utils/request.mock.js');
const { Device } = require('../../../src/models');
const { deviceController } = require('../../../src/controllers');

describe('Device controller', () => {
  let device;
  let user;
  let req;
  let res;
  let next;
  beforeEach(() => {
    device = deviceMocks.createFakeDevice();
    user = userMocks.createFakeUser();
    req = requestMocks.mockRequest(device);
    req.user = user;
    res = requestMocks.mockResponse();
    next = jest.fn();
    Device.find = jest.fn().mockResolvedValue([device]);
  });

  describe('Get user available devices', () => {
    it('should return 500 status code if not authenticated', async () => {
      req.user = null;
      await deviceController.getUserDevices(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(500);
    });

    it('should return 200 status code if valid', async () => {
      await deviceController.getUserDevices(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });

    it('should return array of devices if valid', async () => {
      await deviceController.getUserDevices(req, res, next);
      expect(res.json.mock.calls[0][0].devices).toEqual([device]);
    });
  });
});