const userMocks = require('../../utils/models/user.model.mocks.js');
const requestMocks = require('../../utils/request.mock.js');
const authController = require('../../../src/controllers/auth.controller.js');
const jwt = require('jsonwebtoken');
const config = require('config');
let User = require('../../../src/models/user.model.js');

describe('signup - test', () => {
  let user;
  let req;
  let res;
  let next;
  User = userMocks.User;
  beforeEach(() => {
    user = userMocks.createFakeUser();
    req = requestMocks.mockRequest(user);
    res = requestMocks.mockResponse();
    next = jest.fn();
  });

  it('should throw error 400 when password not equal to password confirm', async () => {
    user.password = '11111111';
    user.passwordConfirm = '22222222';
    req.body = user;
    await authController.signup(req, res, next);
    expect(next.mock.calls.length).toBe(1);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('should return 200 if request is valid', async () => {
    await authController.signup(req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(200);
  });

  it('should return token', async () => {
    await authController.signup(req, res, next);
    expect(res.json.mock.calls.length).toBe(1);
    const token = res.json.mock.calls[0][0].token;
    const decoded = jwt.verify(token, config.get('JWT_KEY'));
    expect(decoded).toBeDefined();
    expect(decoded.id).toBe(user._id.toString());
  });

  it('should return user', async () => {
    await authController.signup(req, res, next);
    expect(res.json.mock.calls.length).toBe(1);
    const newUser = res.json.mock.calls[0][0].user;
    expect(newUser).toBeDefined();
    expect(newUser).toHaveProperty(...Object.keys(user._doc));
  });
});