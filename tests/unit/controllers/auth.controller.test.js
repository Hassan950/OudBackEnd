const userMocks = require('../../utils/models/user.model.mocks.js');
const requestMocks = require('../../utils/request.mock.js');
const { authController } = require('../../../src/controllers');
const jwt = require('jsonwebtoken');
const config = require('config');
let { User, Player } = require('../../../src/models');
const _ = require('lodash');
const { getUser } = require('../../utils/services/user.services.mock.js');
let { emailService, userService, authService, playerService } = require('../../../src/services');


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
    userService.getUser = getUser;
    playerService.createPlayer = jest.fn().mockResolvedValue(null);
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
    it('should send token in x-auth-token header', async () => {
      await authController.signup(req, res, next);
      const headerName = res.setHeader.mock.calls[0][0];
      const token = res.setHeader.mock.calls[0][1];
      expect(headerName).toBe('x-auth-token');
      expect(token).toBe(res.json.mock.calls[0][0].token);
    });

    it('should create new player', async () => {
      await authController.signup(req, res, next);
      expect(playerService.createPlayer.mock.calls.length).toBe(1);
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
      await User.create(user);
      // use it
      user.password = '111111111111111111111'; // differnt password
      req.body = user;
      await authController.login(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });
    it('should return 401 if email is wrong', async () => {
      // create a user
      await User.create(user);
      // use it
      user.email = 'admin@admin.com'; // differnt password
      req.body = user;
      await authController.login(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it('should return 200 if request is valid', async () => {
      // create a user
      await User.create(user);
      // use it
      await authController.login(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });

    it('should return token', async () => {
      // create a user
      await User.create(user);
      // use it
      await authController.login(req, res, next);
      const token = res.json.mock.calls[0][0].token;
      const decoded = jwt.verify(token, config.get('JWT_KEY'));
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(user._id.toString());
    });

    it('should return user', async () => {
      // create a user
      await User.create(user);
      // use it
      await authController.login(req, res, next);
      const newUser = res.json.mock.calls[0][0].user;
      expect(newUser).toBeDefined();
      expect(newUser).toHaveProperty(...Object.keys(user._doc));
    });
    it('should send token in x-auth-token header', async () => {
      // create a user
      await User.create(user);
      // use it
      await authController.login(req, res, next);
      const headerName = res.setHeader.mock.calls[0][0];
      const token = res.setHeader.mock.calls[0][1];
      expect(headerName).toBe('x-auth-token');
      expect(token).toBe(res.json.mock.calls[0][0].token);
    });
  });

  describe('Verify - test', () => {

    describe('check request verify test', () => {
      beforeEach(async () => {
        await User.create(user);
        req.user = user;
      });

      it('should return 500 if route not authenticated', async () => {
        req.user = undefined;
        await authController.requestVerify(req, res, next);
        expect(next.mock.calls[0][0].statusCode).toBe(500);
      });

      it('should return 400 is user is verified', async () => {
        user.verified = true;
        await authController.requestVerify(req, res, next);
        expect(next.mock.calls[0][0].statusCode).toBe(400);
      });

      it('should return 500 if email is failed', async () => {
        emailService.sendEmail = jest.fn().mockRejectedValue(user);
        await authController.requestVerify(req, res, next);
        expect(next.mock.calls[0][0].statusCode).toBe(500);
      });
    });


    describe('check verify token test', () => {
      let verifyToken;
      beforeEach(async () => {
        verifyToken = authService.createVerifyToken(user);
        await User.create(user);
        req.params = {};
        req.params.token = verifyToken;
        userService.getUser = jest.fn().mockImplementation((userData) => {
          return new Promise((resolve, reject) => {
            const user = _.find(userMocks.users, function (obj) {
              return obj.verifyToken === userData.verifyToken;
            });
            if (user) {
              resolve(user);
            } else {
              resolve(null);
            }
          })
        });
      });
      it('should should return 400 if token is invalid', async () => {
        req.params.token = 'invalidToken';
        await authController.verify(req, res, next);
        expect(next.mock.calls[0][0].statusCode).toBe(400);
      });
      it('should change verified to true if token is valid', async () => {
        await authController.verify(req, res, next);
        user = await getUser(user);
        expect(user.verified).toBe(true);
      });
      it('should change verify token to undefined if token is valid', async () => {
        await authController.verify(req, res, next);
        user = await getUser(user);
        expect(user.verifyToken).toBeUndefined();
      });
      it('should save the user if token is valid', async () => {
        await authController.verify(req, res, next);
        user = await getUser(user);
        expect(user.save.mock.calls.length).toBe(1);
      });
      it('should send status 200 if token is valid', async () => {
        await authController.verify(req, res, next);
        expect(res.status.mock.calls[0][0]).toBe(200);
      });
      it('should send user if token is valid', async () => {
        await authController.verify(req, res, next);
        expect(res.json.mock.calls[0][0].user).toHaveProperty(...Object.keys(user._doc));
      });
      it('should send status 200 if token is valid', async () => {
        await authController.verify(req, res, next);
        const token = res.json.mock.calls[0][0].token;
        const decoded = jwt.verify(token, config.get('JWT_KEY'));
        expect(decoded).toBeDefined();
        expect(decoded.id).toBe(user._id.toString());
      });
      it('should send token in x-auth-header', async () => {
        await authController.verify(req, res, next);
        const headerName = res.setHeader.mock.calls[0][0];
        const token = res.setHeader.mock.calls[0][1];
        expect(headerName).toBe('x-auth-token');
        expect(token).toBe(res.json.mock.calls[0][0].token);
      });
    });
  })

  describe('Password - test', () => {
    beforeEach(async () => {
      user.password = '12345678';
      user.passwordConfirm = user.password;
      await User.create(user);
      req.user = user;
      // fill request body
      req.body.currentPassword = user.password;
      req.body.password = '11111111';
      req.body.passwordConfirm = '11111111';
      // mocks
      User.findById = userMocks.findByIdWithSelect;
    });

    describe('Resest Password test', () => {
      beforeEach(() => {
        req.body.passwordConfirm = user.passwordConfirm;
        req.body.password = user.password;
        req.params = {};
        req.params.token = authService.createPasswordResetToken(user);
      });

      it('should return 400 if token is not valid', async () => {
        await authController.resetPassword(req, res, next);
        expect(next.mock.calls[0][0].statusCode).toBe(400);
      });

      it('should return 200 if token is valid', async () => {
        userService.getUser = jest.fn().mockImplementation((data) => {
          return new Promise((resolve, reject) => {
            resolve(user);
          })
        });
        await authController.resetPassword(req, res, next);
        expect(res.status.mock.calls[0][0]).toBe(200);
      });
      it('should return token and user if token is valid', async () => {
        userService.getUser = jest.fn().mockImplementation((data) => {
          return new Promise((resolve, reject) => {
            resolve(user);
          })
        });
        await authController.resetPassword(req, res, next);
        expect(res.json.mock.calls[0][0].token).toBeDefined();
        expect(res.json.mock.calls[0][0].user).toBeDefined();
      });
    });

    describe('Forgot Password test', () => {
      beforeEach(() => {
        req.body = {
          email: user.email
        }
      });

      it('should return 404 if email is not found', async () => {
        req.body.email = 'example@example.com';
        await authController.forgotPassword(req, res, next);
        expect(next.mock.calls[0][0].statusCode).toBe(404);
      });
      it('should generate reset token with expire date', async () => {
        emailService.sendEmail = jest.fn().mockResolvedValue(user);
        await authController.forgotPassword(req, res, next);
        user = await userService.getUser(user);
        expect(user.passwordResetToken).toBeDefined();
        expect(user.passwordResetExpires).toBeDefined();
      });
      it('should save the user', async () => {
        await authController.forgotPassword(req, res, next);
        expect(userMocks.save.mock.calls).toBeDefined();
        expect(userMocks.save.mock.calls.length).toBeGreaterThan(1);
      });
      it('should return status 200 if valid', async () => {
        await authController.forgotPassword(req, res, next);
        expect(res.status.mock.calls[0][0]).toBe(200);
      });
      it('should save the user if valid with token and expire date is undefined', async () => {
        emailService.sendEmail = jest.fn().mockImplementation((Options) => {
          return new Promise((resolve, reject) => {
            reject(Options);
          })
        });
        user = await userService.getUser(user);
        expect(user.passwordResetToken).toBeUndefined();
        expect(user.passwordResetExpires).toBeUndefined();
        await authController.forgotPassword(req, res, next);
        expect(userMocks.save.mock.calls).toBeDefined();
        expect(userMocks.save.mock.calls.length).toBeGreaterThan(2);
      });
      it('should return status 500 if falid', async () => {
        emailService.sendEmail = jest.fn().mockImplementation((Options) => {
          return new Promise((resolve, reject) => {
            reject(Options);
          })
        });
        await authController.forgotPassword(req, res, next);
        expect(next.mock.calls[0][0].statusCode).toBe(500);
      });
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
      it('should send token in x-auth-token header', async () => {
        await authController.updatePassword(req, res, next);
        const headerName = res.setHeader.mock.calls[0][0];
        const token = res.setHeader.mock.calls[0][1];
        expect(headerName).toBe('x-auth-token');
        expect(token).toBe(res.json.mock.calls[0][0].token);
      });
    });
  });

  describe('Facebook auth', () => {
    describe('Facebook auth middleware', () => {
      it('should return 400 if token is invalid', async () => {
        req.user = undefined;
        await authController.facebookAuth(req, res, next);
        expect(next.mock.calls[0][0].statusCode).toBe(400);
      });

      it('should return user and token with 200 if user already connected to facebook', async () => {
        req.user = user;
        await authController.facebookAuth(req, res, next);
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.json.mock.calls[0][0].token).toBeDefined();
        expect(res.json.mock.calls[0][0].user).toHaveProperty(...Object.keys(user._doc));
      });

      it('should return user data with 200 if user is not connected to facebook', async () => {
        req.user = user;
        req.user._id = null;
        await authController.facebookAuth(req, res, next);
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.json.mock.calls[0][0].user).toHaveProperty(...Object.keys(user._doc));
      });
    })

    describe('Facebook Connect middleware', () => {
      it('should call next if access_token is defined', async () => {
        req.body.access_token = 'token';
        await authController.facebookConnect(req, res, next);
        expect(next.mock.calls.length).toBe(1);
      });

      it('should return 500 if user is not authenticated', async () => {
        req.user = null;
        await authController.facebookConnect(req, res, next);
        expect(next.mock.calls[0][0].statusCode).toBe(500);
      });

      it('should disconnect user from facebook and send it with token with status 200', async () => {
        user.facebook_id = 'id';
        req.user = user;
        await authController.facebookConnect(req, res, next);
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.json.mock.calls[0][0].token).toBeDefined();
        expect(res.json.mock.calls[0][0].user).toHaveProperty(...Object.keys(user._doc))
        expect(res.json.mock.calls[0][0].user.facebook_id).toBeUndefined();
      })
    });
  });

  describe('Google auth', () => {
    describe('Google auth middleware', () => {
      it('should return 400 if token is invalid', async () => {
        req.user = undefined;
        await authController.googleAuth(req, res, next);
        expect(next.mock.calls[0][0].statusCode).toBe(400);
      });

      it('should return user and token with 200 if user already connected to google', async () => {
        req.user = user;
        await authController.googleAuth(req, res, next);
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.json.mock.calls[0][0].token).toBeDefined();
        expect(res.json.mock.calls[0][0].user).toHaveProperty(...Object.keys(user._doc));
      });

      it('should return user data with 200 if user is not connected to google', async () => {
        req.user = user;
        req.user._id = null;
        await authController.googleAuth(req, res, next);
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.json.mock.calls[0][0].user).toHaveProperty(...Object.keys(user._doc));
      });
    })

    describe('Google Connect middleware', () => {
      it('should call next if access_token is defined', async () => {
        req.body.access_token = 'token';
        await authController.googleConnect(req, res, next);
        expect(next.mock.calls.length).toBe(1);
      });

      it('should return 500 if user is not authenticated', async () => {
        req.user = null;
        await authController.googleConnect(req, res, next);
        expect(next.mock.calls[0][0].statusCode).toBe(500);
      });

      it('should disconnect user from google and send it with token with status 200', async () => {
        user.google_id = 'id';
        req.user = user;
        await authController.googleConnect(req, res, next);
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.json.mock.calls[0][0].token).toBeDefined();
        expect(res.json.mock.calls[0][0].user).toHaveProperty(...Object.keys(user._doc))
        expect(res.json.mock.calls[0][0].user.google_id).toBeUndefined();
      })
    });
  })
});
