const { Device } = require('../models');

const getDevices = async (userId) => {
  const devices = await Device.find({ userId: userId });
  return devices;
};

module.exports = {
  getDevices
}