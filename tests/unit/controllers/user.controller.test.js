const userMocks = require('../../utils/models/user.model.mocks');
const requestMocks = require('../../utils/request.mock');
const { userController } = require('../../../src/controllers');
const httpStatus = require('http-status');
const fs = require('fs');

describe('User Controllers', () => {
  let user;
  let req;
  let res;
  User = userMocks.User;
  beforeEach(() => {
    user = userMocks.createFakeUser();
    req = requestMocks.mockRequest(user);
    req.user = user;
    res = requestMocks.mockResponse();
    next = jest.fn();
  });
  describe('getProfile - test', () => {
    it('should return 500 if your didn\'t authenticate', async () => {
      req.user = undefined;
      await userController.getProfile(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should return 200 OK with User Object', async () => {
      await userController.getProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.send.mock.calls[0][0]).toHaveProperty('_id');
      expect(res.send.mock.calls[0][0]).toHaveProperty('displayName');
      expect(res.send.mock.calls[0][0]).toHaveProperty('role');
    });
  });

  describe('getUser - test', () => {
    it('should return 200 OK with User Object', async () => {
      req.params = { userId: user._id };
      userMocks.users.push(user);
      User.findById = userMocks.findByIdWithPopulate;
      await userController.getUser(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
      expect(res.send.mock.calls[0][0]).toHaveProperty('_id', user._id);
    });

    it('should return 404 Bad Request if user not found', async () => {
      req.params = { userId: 'NotUser' };
      User.findById = userMocks.findByIdWithPopulate;
      await userController.getUser(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.NOT_FOUND);
    });
  });

  describe('editProfile - test', () => {
    beforeEach(async () => {
      user.password = '12345678';
      user.passwordConfirm = user.password;
      await User.create(user);
      req.user = user;

      req.params = { userId: user._id };
      // fill request body
      req.body = {
        passwordConfirm: '12345678'
      }
      // mocks
      User.findById = userMocks.findByIdWithSelect;
    });

    it('should return 200 OK with User Object', async () => {
      req.params = { userId: user._id };
      await userController.editProfile(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
      expect(res.send.mock.calls[0][0]).toHaveProperty('_id', user._id);
    });

    it('should return 400 Bad Request if confirm password does not match the user password', async () => {
      req.params = { userId: user._id };
      req.body.passwordConfirm = user.password + '123';
      await userController.editProfile(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.BAD_REQUEST);
    });
  });

  describe('updateImages - test', () => {
    beforeEach(async () => {
      user.password = '12345678';
      user.passwordConfirm = user.password;
      await User.create(user);
      req.user = user;
      // fill request files
      req.files = [{
        path: `uploads\\users\\${user.displayName}-${user._id}-${Date.now()}.jpg`
      }]
    })

    it('should send 200 OK when first entry of user images is updated', async () =>{
      await userController.updateImages(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK)
      expect(res.send.mock.calls[0][0].images[0]).toBe(req.files[0].path)
    })

    it('should send 200 OK when first entry of user images is updated', async () =>{
      await userController.updateImages(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK)
      expect(res.send.mock.calls[0][0].images[0]).toBe(req.files[0].path)
    })

    it('Should throw an error if path is invalid', async () => {
      user.images = ['invalidPath.png']
      jest.mock('fs')
      fs.unlink = jest.fn();
      fs.unlink.mockImplementationOnce((filename, callback) => {
        callback(Error);
      });

      try {
        await userController.updateImages(req, res, next)
      }
      catch (e) {
        expect(e).toBe(Error);
      }
    });
  })
});
