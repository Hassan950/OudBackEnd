const categoryMocks = require('../../utils/models/category.model.mocks');

describe('Category model', () => {
  let category;
  beforeEach(() => {
    category = categoryMocks.createFakeStoredCategory();
  });
  describe('Category model - name', () => {
    it('should throw error if no name passed', () => {
      const args = [null, undefined];
      args.forEach(a => {
        category.name = a;
        const error = category.validateSync();
        expect(error.errors['name']).toBeDefined();
      });
    });
    it('should thorw error if name is less than 3 chars', () => {
      category.name = '12';
      const error = category.validateSync();
      expect(error.errors['name']).toBeDefined();
    });
    it('should thorw error if name is more than 20 chars', () => {
      category.name = new Array(21).fill('1');
      const error = category.validateSync();
      expect(error.errors['name']).toBeDefined();
    });
  });
  describe('Category model - icon', () => {
    it('should thorw error if no icon passed', () => {
      const args = [null, undefined];
      args.forEach(a => {
        category.icon = a;
        const error = category.validateSync();
        expect(error.errors['icon']).toBeDefined();
      });
    });
  });
  describe('Category model - Type', () => {
    it('Should return undefined when validating a valid category', () => {
      expect(category.type).toBe("category");
    });
  });
});
