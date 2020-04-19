const { Device } = require('../../../src/models');
const mongoose = require('mongoose');
const faker = require('faker');

const createFakeDevice = () => {
  const device = new Device({
    _id: mongoose.Types.ObjectId(),
    id: faker.internet.userName(),
    isActive: false,
    isPrivateSession: false,
    volumePercent: 50,
    type: 'Computer',
    name: faker.internet.userName(),
    userId: mongoose.Types.ObjectId()
  });
  return device;
};

const devices = [
  createFakeDevice(),
  createFakeDevice(),
  createFakeDevice()
];



module.exports = {
  createFakeDevice,
  devices
}