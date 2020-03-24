const { Device } = require('../models');

const getAvailableDevices = async (userId) => {
  const devices = await Device.find({ userId: userId, isActive: true });
  return devices;
};

module.exports = {
  getAvailableDevices
}