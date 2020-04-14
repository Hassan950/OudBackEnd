const userMocks = require('../../utils/models/normal.model.mocks.js');
const moment = require('moment');

describe('User model', () => {
  let user;
  beforeEach(() => {
    user = userMocks.createFakeUser();
    const age = moment().diff(user.birthDate, 'years');
  });

  describe('user model - role', () => {
    it('should be required', () => {
      const args = [null, undefined];
      args.forEach(a => {
        user.passwordConfirm = a;
        const error = user.validateSync();
        expect(error.errors['passwordConfirm']).toBeDefined();
      });
    });

    it('should be [free, premium] only', () => {
      const args = ['free', 'premium'];
      args.forEach(a => {
        user.role = a;
        const error = user.validateSync();
        expect(error).toBeUndefined();
      });
      user.role = 'a';
      const error = user.validateSync();
      expect(error.errors['role']).toBeDefined();
    });
  });
});
