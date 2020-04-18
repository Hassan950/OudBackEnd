const { Request } = require('../../../src/models');

describe('Request model', () => {
  let request;
  beforeEach(() => {
    request = new Request({
      displayName: 'Mohamed',
      name: 'hassan',
      email: 'lol.9@xd.com',
      genres: '5e6c8ebb8b40fc5508fe8b32',
      bio: 'not longer than 255'
    });
  });
  it('Should return undefined when validating a valid request', () => {
    expect(request.validateSync()).toBeUndefined();
  });
  it("Should throw an error if no genre ID's were passed (empty list or no list at all)", () => {
    request.genres = null;
    expect(request.validateSync().errors['genres']).toBeDefined();
    request.genres = [];
    expect(request.validateSync().errors['genres']).toBeDefined();
  });
  it("Should throw an error if ID's are not valid object ID's", () => {
    request.genres = ['not a valid'];
    expect(request.validateSync().errors['genres']).toBeDefined();
  });
  it('Should throw an error if bio is longer than 255 characters', () => {
    request.bio =
      'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine. I am so happy,';
    expect(request.validateSync().errors['bio']).toBeDefined();
  });
  it('should throw an error if the email is not valid', () => {
    request.email = 'example';
    expect(request.validateSync().errors['email']).toBeDefined();
  });
  it('should throw an error if the email is not provided', () => {
    request.email = null;
    expect(request.validateSync().errors['email']).toBeDefined();
  });
  it('should throw error if no displayName passed', () => {
    const args = [null, undefined];
    args.forEach(a => {
      request.displayName = a;
      const error = request.validateSync();
      expect(error.errors['displayName']).toBeDefined();
    });
  });
  it('should thorw error if no name passed', () => {
    const args = [null, undefined];
    args.forEach(a => {
      request.name = a;
      const error = request.validateSync();
      expect(error.errors['name']).toBeDefined();
    });
  });

  it('should thorw error if name is less than 5 chars', () => {
    request.name = '1234';
    const error = request.validateSync();
    expect(error.errors['name']).toBeDefined();
  });
});
