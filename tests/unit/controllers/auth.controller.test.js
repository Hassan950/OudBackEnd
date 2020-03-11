const userMocks = require('../../utils/models/user.model.mocks.js');
const requestMocks = require('../../utils/request.mock.js');
const authController = require('../../../src/controllers/auth.controller.js');
const jwt = require('jsonwebtoken');
const config = require('config');
let { User } = require('../../../src/models/user.model.js');
const authService = require('../../../src/services/auth.services.js');
const _ = require('lodash');

describe('Auth controllers', () => {
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

  describe('signup - test', () => {
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


  describe('login test', () => {
    it('should return 401 if user is not found', async () => {
      // the user we created is not in the list
      await authController.login(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it('should return 401 if password is wrong', async () => {
      // create a user
      await authController.signup(req, res, next);
      // use it
      user.password = '111111111111111111111'; // differnt password
      req.body = user.password;
      await authController.login(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it('should return 200 if request is valid', async () => {
      // create a user
      await authController.signup(req, res, next);
      // use it
      await authController.login(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });

    it('should return token', async () => {
      // create a user
      await authController.signup(req, res, next);
      // use it
      await authController.login(req, res, next);
      const token = res.json.mock.calls[0][0].token;
      const decoded = jwt.verify(token, config.get('JWT_KEY'));
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(user._id.toString());
    });

    it('should return user', async () => {
      // create a user
      await authController.signup(req, res, next);
      // use it
      await authController.login(req, res, next);
      const newUser = res.json.mock.calls[0][0].user;
      expect(newUser).toBeDefined();
      expect(newUser).toHaveProperty(...Object.keys(user._doc));
    });
  });

  describe('Authenticate test', () => {
    it('should return 401 if no token passed', async () => {
      await authController.authenticate(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it('should return 401 if token passed without Bearer', async () => {
      const token = authService.generateAuthToken(user._id);
      req.headers = {};
      req.headers.authorization = token;
      await authController.authenticate(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it('should return 401 if token passed with id doesn`t exists', async () => {
      const token = authService.generateAuthToken(user._id);
      req.headers = {};
      req.headers.authorization = `Bearer ${token}`;
      await authController.authenticate(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it('should append user to req if valid token', async () => {
      await authController.signup(req, res, next);
      const token = authService.generateAuthToken(user._id);
      req.headers = {};
      req.headers.authorization = `Bearer ${token}`;
      await authController.authenticate(req, res, next);
      expect(req.user).toBeDefined();
      expect(req.user).toHaveProperty(...Object.keys(user._doc));
    });

    it('should call next if valid token', async () => {
      await authController.signup(req, res, next);
      const token = authService.generateAuthToken(user._id);
      req.headers = {};
      req.headers.authorization = `Bearer ${token}`;
      await authController.authenticate(req, res, next);
      expect(next.mock.calls.length).toBe(1);
    });
  });

  describe('Authorize test', () => {
    it('should return 403 if you don`t have permission', () => {
      const args = ['free', 'premium', 'artist'];
      args.forEach(async a => {
        user.role = a;
        authController.authorize(_.filter(args, function (el) {
          return el != a;
        }))
      });
    });

    it('should call next if valid', () => {
      const args = ['free', 'premium', 'artist'];
      args.forEach(async a => {
        user.role = a;
        authController.authorize(args);
      });
    });
  });

  describe('Password - test', () => {
    beforeEach(async () => {
      user.password = '12345678';
      user.passwordConfirm = user.password;
      await User.create(user);
      req.user = user;
      // fill request body
      req.body = {};
      req.body = {
        currentPassword: user.password,
        password: '11111111',
        passwordConfirm: '11111111'
      }
      // mocks
      User.findById = userMocks.findByIdWithSelect;
    });

    describe('Update Password test', () => {
      it('should return 500 if your didn`t authenticate', async () => {
        req.user = undefined;
        await authController.updatePassword(req, res, next);
        expect(next.mock.calls[0][0].statusCode).toBe(500);
      })
      it('should return 401 if password is wrong', async () => {
        req.body.currentPassword = '11111111' // different from password we created the user with
        await authController.updatePassword(req, res, next);
        expect(next.mock.calls[0][0].statusCode).toBe(401);
      })
      it('should return 401 if no user found with the given id', async () => {
        req.user = userMocks.createFakeUser();
        await authController.updatePassword(req, res, next);
        expect(next.mock.calls[0][0].statusCode).toBe(401);
      });
      it('should return 400 if password doesn`t match with password confirm', async () => {
        req.body.passwordConfirm = '22222222';
        await authController.updatePassword(req, res, next);
        expect(next.mock.calls[0][0].statusCode).toBe(400);
      });
      it('should save the user', async () => {
        await authController.updatePassword(req, res, next);
        expect(userMocks.save.mock.calls).toBeDefined();
        expect(userMocks.save.mock.calls.length).toBe(1);
      });
      it('should return 200 if input is valid', async () => {
        await authController.updatePassword(req, res, next);
        expect(res.status.mock.calls[0][0]).toBe(200);
      });
      it('should return token if input is valid', async () => {
        await authController.updatePassword(req, res, next);
        const token = res.json.mock.calls[0][0].token;
        const decoded = jwt.verify(token, config.get('JWT_KEY'));
        expect(decoded).toBeDefined();
        expect(decoded.id).toBe(user._id.toString());
      });
      it('should return user if input is valid', async () => {
        await authController.updatePassword(req, res, next);
        const newUser = res.json.mock.calls[0][0].user;
        expect(newUser).toBeDefined();
        expect(newUser).toHaveProperty(...Object.keys(user._doc));
      });
    });
  });
});