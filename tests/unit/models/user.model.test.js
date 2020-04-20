const userMocks = require('../../utils/models/user.model.mocks.js');
const moment = require('moment');

describe('User model', () => {
  let user;
  beforeEach(() => {
    user = userMocks.createFakeUser();
    const age = moment().diff(user.birthDate, 'years');
  });

  describe('User model - displayName', () => {
    it('should throw error if no displayName passed', () => {
      const args = [null, undefined];
      args.forEach(a => {
        user.displayName = a;
        const error = user.validateSync();
        expect(error.errors['displayName']).toBeDefined();
      });
    });
  });

  describe('User model - username', () => {
    it('should thorw error if no username passed', () => {
      const args = [null, undefined];
      args.forEach(a => {
        user.username = a;
        const error = user.validateSync();
        expect(error.errors['username']).toBeDefined();
      });
    });

    it('should thorw error if username is less than 5 chars', () => {
      user.username = '1234';
      const error = user.validateSync();
      expect(error.errors['username']).toBeDefined();
    });

    it('should thorw error if username is more than 30 chars', () => {
      user.username = new Array(31).fill('1');
      const error = user.validateSync();
      expect(error.errors['username']).toBeDefined();
    });
  });

  describe('user model - email', () => {
    it('should be in a valid email format', () => {
      user.email = 'example';
      const error = user.validateSync();
      expect(error.errors['email']).toBeDefined();
    });

    it('should be required', () => {
      const args = [null, undefined];
      args.forEach(a => {
        user.email = a;
        const error = user.validateSync();
        expect(error.errors['email']).toBeDefined();
      });
    })
  });

  describe('user model - password', () => {
    it('should be required', () => {
      const args = [null, undefined];
      args.forEach(a => {
        user.password = a;
        const error = user.validateSync();
        expect(error.errors['password']).toBeDefined();
      });
    })

    it('should be longer than 8 chars', () => {
      user.password = '1';
      const error = user.validateSync();
      expect(error.errors['password']).toBeDefined();
    })
  });

  describe('user model - passwordConfirm', () => {
    it('should be required', () => {
      const args = [null, undefined];
      args.forEach(a => {
        user.passwordConfirm = a;
        const error = user.validateSync();
        expect(error.errors['passwordConfirm']).toBeDefined();
      });
    })

    it('should be longer than 8 chars', () => {
      user.passwordConfirm = '1';
      const error = user.validateSync();
      expect(error.errors['passwordConfirm']).toBeDefined();
    })

    it('should be equal to password', () => {
      user.passwordConfirm = new Array(8).fill('1');
      user.password = new Array(8).fill('2');
      const error = user.validateSync();
      expect(error.errors['passwordConfirm']).toBeDefined();
    })
  })


  describe('user model - gender', () => {
    it('should be [M,F] only', () => {
      const args = ['M', 'F'];
      args.forEach(a => {
        user.gender = a;
        const error = user.validateSync();
        expect(error).toBeUndefined();
      });
      user.gender = 'T';
      const error = user.validateSync();
      expect(error.errors['gender']).toBeDefined();
    })
  });

  describe('user model - country', () => {
    it('should be valid iso alpha 2 country', () => {
      user.country = 'AAA';
      const error = user.validateSync();
      expect(error.errors['country']).toBeDefined();
    })

    it('should be required', () => {
      const args = [null, undefined];
      args.forEach(a => {
        user.country = a;
        const error = user.validateSync();
        expect(error.errors['country']).toBeDefined();
      });
    });
  });

  describe('user model - birthDate', () => {
    it('You must be at least 10 years old', () => {
      user.birthDate = moment().subtract(1, 'years');
      const error = user.validateSync();
      expect(error.errors['birthDate']).toBeDefined();
    });
  });

  describe('user model - images', () => {
    it('throw an error if an entry does not match the following pattern: uploads\\users\\displayName-userId-timestamp.(jpg|jpeg|png)', () => {
      user.images = ['notValidName'];
      const error = user.validateSync();
      expect(error.errors['images.0']).toBeDefined();
    })
    it('if no images were set array will have by default have entries for profile and cover and more default options', () => {
      user.images = [];
      user.validateSync();
      expect(user.images.length).toBeGreaterThan(0);
      user.images.forEach(path => expect(path).toMatch(/^(uploads\\users\\)(default-){1,1}[a-zA-Z]+\.(jpg|png|jpeg|svg)$/));
    })
    it('if user uploaded images less than the default options array will be completed automatically', () => {
      user.images = ['uploads\\users\\fakeName-5e6ba8747d3eda317003c976-1584622066176.jpeg'];
      user.validateSync();
      expect(user.images.length).toBeGreaterThan(1);
      user.images.slice(1).forEach(path => expect(path).toMatch(/^(uploads\\users\\)(default-){1,1}[a-zA-Z]+\.(jpg|png|jpeg)$/));
    })
    it('should accept paths that match the following pattern: uploads\\users\\displayName-userId-timestamp.(jpg|jpeg|png)', () => {
      user.images = [
        'uploads\\users\\fakeName-5e6ba8747d3eda317003c976-1584622066176.jpeg', 
        'uploads\\users\\fakeName-5e6ba8747d3eda317003c976-1584622066180.jpeg',
        'uploads\\users\\fakeName-5e6ba8747d3eda317003c976-1584622066189.jpeg'
      ];
      const error = user.validateSync();
      expect(user.images.length).toBe(3);
      expect(error).toBeUndefined();
    }) 
  })
});
