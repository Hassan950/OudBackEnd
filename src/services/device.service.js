const { Device } = require('../models');

const getAvailableDevices = async (userId) => {
  const devices = await Device.find({ userId: userId, isActive: true });
  return devices;
};


const getDevice = async (id) => {
  const device = await Device.findOne({ id: id });
  return device;
};


module.exports = {
  getAvailableDevices,
  getDevice
}