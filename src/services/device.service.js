const { Device } = require('../models');


/**
 * Get Available Devices with the given userId
 * 
 * @function
 * @async
 * @author Abdelrahman Tarek
 * @param {String} userId User ID 
 * @returns {Array<Document>} devices
 * @summary Get Available Devices
 */
const getAvailableDevices = async (userId) => {
  const devices = await Device.find({ userId: userId, isActive: true });
  return devices;
};


/**
 * Get Device with the given id
 * 
 * @function
 * @async
 * @author Abdelrahman Tarek
 * @param {String} id Device ID 
 * @returns {Document} device if found
 * @returns {null} if not found
 * @summary Get Device
 */
const getDevice = async (id) => {
  const device = await Device.findOne({ id: id });
  return device;
};


module.exports = {
  getAvailableDevices,
  getDevice
}