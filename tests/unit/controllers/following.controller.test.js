const { followingController } = require('../../../src/controllers/');
const { Followings } = require('../../../src/models');
const AppError = require('../../../src/utils/AppError');
const httpStatus = require('http-status');
const requestMocks = require('../../utils/request.mock');
const mockingoose = require('mockingoose').default;

describe('Following controller', () => {
  let req;
  let res;
  let next;
  let following;
  beforeEach(() => {
    following = new Followings({
      userId: '5e6ba8747d3eda317003c976',
      followedId: '5e6ba6917fb1cf2ad80b4fb2',
      type: 'User'
    });
    following.populate = jest.fn().mockReturnThis();
    following.select = jest.fn().mockReturnThis();
    req = { params: {}, query: {}, body: {}, user: following.userId };
    res = requestMocks.mockResponse();
    next = jest.fn();
  });
  describe('checkFollowings', () => {
    it('Should return list of boolean that indicates the following for each user/artist with status code 200', async () => {
      mockingoose(Followings).toReturn([following], 'find');
      // two valid ID's
      req.query.ids = ['5e6ba6917fb1cf2ad80b4fb2', '5e6ba8747d3eda317003c976'];
      await followingController.checkFollowings(req, res, next);
      expect(res.send.mock.calls[0][0]).toEqual(
        expect.arrayContaining([true, false])
      );
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });

    it('Should return an array contains falses when no following found', async () => {
      mockingoose(Followings).toReturn([], 'find');
      // two valid ID's
      req.query.ids = ['5e6ba6917fb1cf2ad80b4fb2', '5e6ba8747d3eda317003c976'];
      await followingController.checkFollowings(req, res, next);
      expect(res.send.mock.calls[0][0]).toEqual([false, false]);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });
  });
});
