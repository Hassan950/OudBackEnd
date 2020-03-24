const deviceMocks = require('../../utils/models/device.model.mocks');

describe('Device model', () => {
  let device;
  beforeEach(() => {
    device = deviceMocks.createFakeDevice();
  });

  describe('Device model - name', () => {
    it('should be required', () => {
      const args = [null, undefined];
      args.forEach(a => {
        device.name = a;
        const error = device.validateSync();
        expect(error.errors['name']).toBeDefined();
      });
    });
  });

  describe('Device model - userId', () => {
    it('should be required', () => {
      const args = [null, undefined];
      args.forEach(a => {
        device.userId = a;
        const error = device.validateSync();
        expect(error.errors['userId']).toBeDefined();
      });
    });
  });
});