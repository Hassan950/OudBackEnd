const requestMocks = require('../../utils/request.mock');
const { userController } = require('../../../src/controllers');
const { userService } = require('../../../src/services');
const httpStatus = require('http-status');
const mockingoose = require('mockingoose').default;
const { User } = require('../../../src/models');
const fs = require('fs');

describe('User Controllers', () => {
  let user;
  let req;
  let res;
  let next;
  beforeEach(() => {
    user = new User({
      displayName: 'test',
      verified: true,
      type: 'User',
      country: 'EG',
      email: 'test@gmail.com',
      username: 'lolxD'
    });
    req = { params: {}, query: {}, body: {} };
    req.user = user;
    res = requestMocks.mockResponse();
    next = jest.fn();
  });
  describe('getProfile - test', () => {
    it("should return 500 if your didn't authenticate", async () => {
      req.user = undefined;
      await userController.getProfile(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(
        httpStatus.INTERNAL_SERVER_ERROR
      );
    });

    it('should return 200 OK with User Object', async () => {
      await userController.getProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.send.mock.calls[0][0]).toBe(user);
    });
  });

  describe('getUser - test', () => {
    it('should return 200 OK with User Object', async () => {
      req.params = { userId: user._id };
      mockingoose(User).toReturn(user, 'findOne');
      await userController.getUser(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
      expect(res.send.mock.calls[0][0]).toBe(user);
    });

    it('should return 404 Bad Request if user not found', async () => {
      req.params = { userId: 'NotUser' };
      mockingoose(User).toReturn(undefined, 'findOne');
      await userController.getUser(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.NOT_FOUND);
    });
  });

  describe('editProfile - test', () => {
    beforeEach(async () => {
      req.params = { userId: user._id };
      // fill request body
      userService.findUserByIdAndCheckPassword = jest.fn();
    });

    it('should return 200 OK with User Object', async () => {
      req.params = { userId: user._id };
      userService.findUserByIdAndCheckPassword.mockReturnValueOnce(user);
      mockingoose(User).toReturn(user, 'findOneAndUpdate');
      await userController.editProfile(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
      expect(res.send.mock.calls[0][0]).toBe(user);
    });

    it('should return 400 Bad Request if confirm password does not match the user password', async () => {
      req.params = { userId: user._id };
      userService.findUserByIdAndCheckPassword.mockReturnValueOnce(null);
      await userController.editProfile(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.BAD_REQUEST);
    });
  });

  describe('updateImages - test', () => {
    beforeEach(async () => {
      req.user = user;
      // fill request files
      req.files = [
        {
          path: `uploads\\users\\${user.displayName}-${
            user._id
          }-${Date.now()}.jpg`
        }
      ];
    });

    it('should send 200 OK when first entry of user images is updated', async () => {
      const updatedUser = user;
      updatedUser.images = req.files[0].path;
      mockingoose(User).toReturn(updatedUser, 'findOneAndUpdate');
      await userController.updateImages(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
      expect(res.send.mock.calls[0][0].images[0]).toBe(req.files[0].path);
    });

    it('Should throw an error if fs failed for any reason other than "ENOENT (No such file or directory)"', async () => {
      user.images = ['FileThatCausesStrangeProblems.png'];
      const error = { code: 'EACCES', message: 'Permission denied' };
      jest.mock('fs');
      fs.promises.unlink = jest.fn();
      fs.promises.unlink.mockImplementationOnce(() => Promise.reject(error));
      expect.assertions(1);

      try {
        await userController.updateImages(req, res, next);
      } catch (e) {
        expect(e).toBe(error);
      }
    });
  });
});
