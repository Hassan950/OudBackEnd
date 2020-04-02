const { Queue } = require('../../../src/models');
const mongoose = require('mongoose');

const createFakeQueue = () => {
  const queue = new Queue({
    tracks: [mongoose.Types.ObjectId()],
    context: {
      type: 'album',
      id: mongoose.Types.ObjectId()
    },
  });
};

const queues = [
  createFakeQueue(),
  createFakeQueue(),
  createFakeQueue()
];

module.exports = {
  createFakeQueue,
  queues
}