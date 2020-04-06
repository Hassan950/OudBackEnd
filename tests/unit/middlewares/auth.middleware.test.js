const { authController } = require('../../../src/controllers');
const authMiddleware = require('../../../src/middlewares/auth.js');
const { authService, emailService, playerService } = require('../../../src/services');
const requestMocks = require('../../../tests/utils/request.mock.js');
const userMocks = require('../../utils/models/user.model.mocks.js');
const emailServiceMocks = require('../../utils/services/email.services.mock');
const _ = require('lodash');

describe('Authenticate test', () => {
  let req;
  let res;
  let next;
  User = userMocks.User;
  beforeEach(() => {
    user = userMocks.createFakeUser();
    req = requestMocks.mockRequest(user);
    res = requestMocks.mockResponse();
    next = jest.fn();
    emailService.sendEmail = emailServiceMocks.sendEmail;
    playerService.createPlayer = jest.fn().mockResolvedValue(null);
  });

  it('should return 401 if no token passed', async () => {
    await authMiddleware.authenticate(req, res, next);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('should return 401 if token passed without Bearer', async () => {
    const token = authService.generateAuthToken(user._id);
    req.headers = {};
    req.headers.authorization = token;
    await authMiddleware.authenticate(req, res, next);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('should return 401 if token passed with id doesn`t exists', async () => {
    const token = authService.generateAuthToken(user._id);
    req.headers = {};
    req.headers.authorization = `Bearer ${token}`;
    await authMiddleware.authenticate(req, res, next);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('should append user to req if valid token', async () => {
    User.findById = jest.fn().mockResolvedValue(user);
    await authController.signup(req, res, next);
    const token = authService.generateAuthToken(user._id);
    req.headers = {};
    req.headers.authorization = `Bearer ${token}`;
    await authMiddleware.authenticate(req, res, next);
    expect(req.user).toBeDefined();
    expect(req.user).toHaveProperty(...Object.keys(user._doc));
  });

  it('should call next if valid token', async () => {
    await authController.signup(req, res, next);
    const token = authService.generateAuthToken(user._id);
    req.headers = {};
    req.headers.authorization = `Bearer ${token}`;
    await authMiddleware.authenticate(req, res, next);
    expect(next.mock.calls.length).toBe(1);
  });
});

describe('Authorize test', () => {
  it('should return 403 if you don`t have permission', () => {
    const args = ['free', 'premium', 'artist'];
    args.forEach(async a => {
      user.role = a;
      authMiddleware.authorize(_.filter(args, function (el) {
        return el != a;
      }))
    });
  });

  it('should call next if valid', () => {
    const args = ['free', 'premium', 'artist'];
    args.forEach(async a => {
      user.role = a;
      authMiddleware.authorize(args);
    });
  });
});