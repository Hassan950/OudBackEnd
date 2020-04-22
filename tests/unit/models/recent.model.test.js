const { Recent } = require('../../../src/models');

describe('Recent model', () => {
  let recent;
  beforeEach(() => {
    recent = new Recent({
      userId:'5e909be7cfe5b521a0ccf3ec',
      items:['5e909be7cfe5b521a0ccf3ed'],
      types:['5e909be7cfe5b521a0ccf3ee']
    });
  });
  describe('Recent model - name', () => {
    it('should throw error if no userId passed', () => {
      const args = [null, undefined];
      args.forEach(a => {
        recent.userId = a;
        const error = recent.validateSync();
        expect(error.errors['userId']).toBeDefined();
      });
    });
  });
});
