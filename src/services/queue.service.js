const { Queue } = require('../models');

exports.getQueueById = async (id) => {
  const queue = await Queue.findById(id);
  return queue;
};