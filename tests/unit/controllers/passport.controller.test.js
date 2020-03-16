const requestMocks = require('../../utils/request.mock.js');
const userMocks = require('../../utils/models/user.model.mocks.js');
const { passportController } = require('../../../src/controllers');
const { userService } = require('../../../src/services');
const _ = require('lodash');

describe('Passport Controller test', () => {
  describe('Facebook Auth test', () => {
    let user;
    let req;
    let access_token;
    let refreshToken;
    let profile;
    let done;
    const run = async () => {
      await passportController.facebookPassport(
        req,
        access_token,
        refreshToken,
        profile,
        done
      );
    };
    beforeEach(async () => {
      user = userMocks.createFakeUser();
      user.facebook_id = user._id;
      req = requestMocks.mockRequest(user);
      access_token = {};
      done = jest.fn();
      profile = {
        id: user.facebook_id,
        emails: [{ value: user.email }],
        gender: 'M',
        displayName: user.displayName,
        photos: [{ value: user.images[0] }],
        _json: { birthday: user.birthDate }
      };
      userService.getUser = jest.fn().mockImplementation((userData) => {
        return new Promise((resolve, reject) => {
          const user = _.find(userMocks.users, function (obj) {
            return obj.facebook_id === userData.facebook_id;
          });
          if (user) {
            resolve(user);
          } else {
            resolve(null);
          }
        })
      });
    });

    afterEach(() => {
      _.remove(userMocks.users, (obj) => { return obj._id == user._id; });
    })
    it('should throw error with 400 status code if facebook_id is found', async () => {
      req.user = user;
      req.user.facebook_id = 'facebook_id';
      try {
        await run();
      } catch (error) {
        expect(error.statusCode).toBe(400);
      }
    });

    it('should call done with null and user', async () => {
      req.user = user;
      req.user.facebook_id = undefined;
      await run();
      expect(done.mock.calls[0][0]).toBe(null);
      expect(done.mock.calls[0][1]).toHaveProperty(...Object.keys(user._doc));
    });

    it('should add facebook_id to user', async () => {
      req.user = user;
      req.user.facebook_id = undefined;
      profile.id = 'id';
      await run();
      expect(req.user.facebook_id).toBe(profile.id);
    });

    it('should call done with null and user if found', async () => {
      await userMocks.User.create(user);
      await run();
      expect(done.mock.calls[0][0]).toBe(null);
      expect(done.mock.calls[0][1]).toHaveProperty(...Object.keys(user._doc));
    });

    it('should call done with new user and null if user not found', async () => {
      await run();
      const newUser = {
        facebook_id: profile.id,
        email: profile.emails[0].value,
        gender: (profile.gender === 'male') ? 'F' : 'M',
        displayName: profile.displayName,
        images: [profile.photos[0].value],
        birthDate: new Date(profile._json.birthday),
      };
      expect(done.mock.calls[0][0]).toBe(null);
      expect(done.mock.calls[0][1]).toEqual(newUser);
    });

    it('should call done with error if error thrown', async () => {
      const error = new Error('message');
      userService.getUser = jest.fn().mockImplementation((data) => {
        throw error;
      });
      await run();
      expect(done.mock.calls[0][0]).toBe(error);
      expect(done.mock.calls[0][1]).toBe(false);
      expect(done.mock.calls[0][2]).toBe(error.message);
    });
  })
})