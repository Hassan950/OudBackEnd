const User = require('../../../src/models/user.model.js');
const faker = require('faker');

exports.createFakeUser = () => {
  const password = faker.internet.password(8, true);
  console.log(password);
    const user = new User({
      displayName: faker.name.firstName(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      images: [
        faker.internet.url()
      ],
      password: password,
      passwordConfirm: password,
      role: 'free',
      birthDate: faker.date.past(),
      gender: 'M',
      verified: false,
      country: 'EG'
    });
  return user;
}