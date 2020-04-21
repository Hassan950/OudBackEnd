const authMiddleware = require('../../../src/middlewares/auth.js');
const { authService } = require('../../../src/services');
const { User } = require('../../../src/models');
const requestMocks = require('../../../tests/utils/request.mock.js');
const _ = require('lodash');
const faker = require('faker');
const mockingoose = require('mockingoose').default;
const moment = require('moment');
const mongoose = require('mongoose');

describe('Authenticate test', () => {
  let req;
  let res;
  let next;
  let token;
  let user;
  let changeTime;
  beforeEach(() => {
    const password = faker.internet.password(8, true);
    user = new User({
      displayName: faker.name.firstName(),
      username: faker.name.findName(),
      email: faker.internet.email(),
      password: password,
      passwordConfirm: password,
      role: 'free',
      birthDate: faker.date.between(
        moment().subtract(11, 'years'),
        moment().subtract(150, 'years')
      ), // from 11 to 150 years
      gender: 'M',
      verified: false,
      country: 'EG',
      images: [
        'uploads\\users\\default-Profile.jpg',
        'uploads\\users\\default-Cover.jpg'
      ],
      _id: mongoose.Types.ObjectId(),
      type: 'User'
    });
    changeTime = 0;
    user.changedPasswordAfter = jest.fn((time) => {
      return changeTime > time;
    });
    req = requestMocks.mockRequest(user);
    res = requestMocks.mockResponse();
    next = jest.fn();
    token = authService.generateAuthToken(user._id);
    req.headers = {};
    req.headers.authorization = `Bearer ${token}`;
    mockingoose(User).toReturn(user, 'findOne');

  });

  it('should return 401 if headers is undefined', async () => {
    req.headers = undefined;
    await authMiddleware.authenticate(req, res, next);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('should return 401 if headers.authorization is undefined', async () => {
    req.headers.authorization = undefined;
    await authMiddleware.authenticate(req, res, next);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('should return 401 if headers.authorization not starts with Bearer', async () => {
    req.headers.authorization = token;
    await authMiddleware.authenticate(req, res, next);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('should return 400 if token is invalid', async () => {
    token = 'invalid token';
    req.headers.authorization = `Bearer ${token}`;
    await authMiddleware.authenticate(req, res, next);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('should return 401 if user is not existed', async () => {
    mockingoose(User).toReturn(null, 'findOne');
    await authMiddleware.authenticate(req, res, next);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('should return 401 if user changed password after creating the token', async () => {
    changeTime = parseInt(new Date().getTime() / 1000) + 100;
    await authMiddleware.authenticate(req, res, next);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('should add user to req.user if valid', async () => {
    await authMiddleware.authenticate(req, res, next);
    expect(req.user).toBeDefined();
    expect(req.user).toBe(user);
  });

  it('should change premium user back to free plan if the plan has expired', async () => {
    user.plan = new Date().valueOf() - 10000;
    user.role = 'premium'
    await authMiddleware.authenticate(req, res, next);
    expect(user.role).toBe('free');
    expect(user.plan).toBeUndefined();
    expect(req.user).toBeDefined();
    expect(req.user).toBe(user);
  });

  it('should call next if valid', async () => {
    await authMiddleware.authenticate(req, res, next);
    expect(next.mock.calls.length).toBe(1);
  });
});

describe('Optional Authenticate test', () => {
  let req;
  let res;
  let next;
  let token;
  let user;
  let changeTime;
  beforeEach(() => {
    const password = faker.internet.password(8, true);
    user = new User({
      displayName: faker.name.firstName(),
      username: faker.name.findName(),
      email: faker.internet.email(),
      password: password,
      passwordConfirm: password,
      role: 'free',
      birthDate: faker.date.between(
        moment().subtract(11, 'years'),
        moment().subtract(150, 'years')
      ), // from 11 to 150 years
      gender: 'M',
      verified: false,
      country: 'EG',
      images: [
        'uploads\\users\\default-Profile.jpg',
        'uploads\\users\\default-Cover.jpg'
      ],
      _id: mongoose.Types.ObjectId()
    });
    changeTime = 0;
    user.changedPasswordAfter = jest.fn((time) => {
      return changeTime > time;
    });
    req = requestMocks.mockRequest(user);
    res = requestMocks.mockResponse();
    next = jest.fn();
    token = authService.generateAuthToken(user._id);
    req.headers = {};
    req.headers.authorization = `Bearer ${token}`;
    mockingoose(User).toReturn(user, 'findOne');
  });

  it('should call next if headers is undefined', async () => {
    req.headers = undefined;
    await authMiddleware.optionalAuth(req, res, next);
    expect(next.mock.calls.length).toBe(1);
  });

  it('should call next if headers.authorization is undefined', async () => {
    req.headers.authorization = undefined;
    await authMiddleware.optionalAuth(req, res, next);
    expect(next.mock.calls.length).toBe(1);
  });

  it('should call next if headers.authorization not starts with Bearer', async () => {
    req.headers.authorization = token;
    await authMiddleware.optionalAuth(req, res, next);
    expect(next.mock.calls.length).toBe(1);
  });

  it('should return 400 if token is invalid', async () => {
    token = 'invalid token';
    req.headers.authorization = `Bearer ${token}`;
    await authMiddleware.optionalAuth(req, res, next);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('should return 401 if user is not existed', async () => {
    mockingoose(User).toReturn(null, 'findOne');
    await authMiddleware.optionalAuth(req, res, next);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('should return 401 if user changed password after creating the token', async () => {
    changeTime = parseInt(new Date().getTime() / 1000) + 100;
    await authMiddleware.optionalAuth(req, res, next);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('should add user to req.user if valid', async () => {
    await authMiddleware.optionalAuth(req, res, next);
    expect(req.user).toBeDefined();
    expect(req.user).toBe(user);
  });

  it('should change premium user back to free plan if the plan has expired', async () => {
    user.plan = new Date().valueOf() - 10000;
    user.role = 'premium'
    await authMiddleware.authenticate(req, res, next);
    expect(user.role).toBe('free');
    expect(user.plan).toBeUndefined();
    expect(req.user).toBeDefined();
    expect(req.user).toBe(user);
  });

  it('should call next if valid', async () => {
    await authMiddleware.optionalAuth(req, res, next);
    expect(next.mock.calls.length).toBe(1);
  });
});

describe('Authorize test', () => {
  let req;
  let res;
  let next;
  let user;
  beforeEach(() => {
    const password = faker.internet.password(8, true);
    user = new User({
      displayName: faker.name.firstName(),
      username: faker.name.findName(),
      email: faker.internet.email(),
      password: password,
      passwordConfirm: password,
      role: 'free',
      birthDate: faker.date.between(
        moment().subtract(11, 'years'),
        moment().subtract(150, 'years')
      ), // from 11 to 150 years
      gender: 'M',
      verified: false,
      country: 'EG',
      images: [
        'uploads\\users\\default-Profile.jpg',
        'uploads\\users\\default-Cover.jpg'
      ],
      _id: mongoose.Types.ObjectId()
    });
    req = requestMocks.mockRequest(user);
    res = requestMocks.mockResponse();
    next = jest.fn();
    req.user = user;
  });

  it('should return 403 if you don`t have permission', () => {
    req.user.role = 'free';
    authMiddleware.authorize('admin')(req, res, next);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it('should call next if valid', () => {
    req.user.role = 'admin';
    authMiddleware.authorize('admin')(req, res, next);
    expect(next.mock.calls.length).toBe(1);
  });
});