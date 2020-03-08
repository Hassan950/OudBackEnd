const userMocks = require('../../utils/models/user.model.mocks.js');


describe('User model', () => {
  let user;
  beforeEach(() => {
    user = userMocks.createFakeUser();
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

  describe('user model - role', () => {
    it('should be required', () => {
      const args = [null, undefined];
      args.forEach(a => {
        user.passwordConfirm = a;
        const error = user.validateSync();
        expect(error.errors['passwordConfirm']).toBeDefined();
      });
    })

    it('should be [free, premium, artist] only', () => {
      const args = ['free', 'premium', 'artist'];
      args.forEach(a => {
        user.role = a;
        const error = user.validateSync();
        expect(error).toBeUndefined();
      });
      user.role = 'a';
      const error = user.validateSync();
      expect(error.errors['role']).toBeDefined();
    })
  });

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
});