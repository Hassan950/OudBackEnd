const { Followings } = require('../../../src/models/index');

describe('Followings model', () => {
  let following;
  beforeEach(() => {
    following = new Followings({
      userId: '5e6ba8747d3eda317003c976',
      followedId: '5e6ba6917fb1cf2ad80b4fb2',
      type: 'User'
    });
  });

  it('expect no error when validating a valid following', () => {
    const error = following.validateSync();
    expect(error).toBeUndefined();
  });

  it('expect error when passing empty userId', () => {
    const args = [null, undefined];
    args.forEach(a => {
      following.userId = a;
      const error = following.validateSync();
      expect(error.errors.userId).toBeDefined();
    });
  });

  it('expect error when passing invalid userId', () => {
    following.userId = 'validId';
    const error = following.validateSync();
    expect(error.errors.userId).toBeDefined();
  });

  it('expect error when passing empty followedId', () => {
    const args = [null, undefined];
    args.forEach(a => {
      following.followedId = a;
      const error = following.validateSync();
      expect(error.errors.followedId).toBeDefined();
    });
  });

  it('expect error when passing invalid followedId', () => {
    following.followedId = 'validId';
    const error = following.validateSync();
    expect(error.errors.followedId).toBeDefined();
  });

  it('expect error when type takes a value that is not a "Artist" nor "User"', () => {
    following.type = 'uSeR';
    const error = following.validateSync();
    expect(error.errors.type).toBeDefined();
  })

  it('expect error when type is empty', () => {
    const args = [null, undefined];
    args.forEach(a => {
      following.type = a;
      const error = following.validateSync();
      expect(error.errors.type).toBeDefined();
    });
  })
});
