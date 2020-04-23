const { PlayHistory } = require('../../../src/models');
const mongoose = require('mongoose');

const createFakePlayHistory = () => {
  const playHistory = new PlayHistory({
    _id: mongoose.Types.ObjectId(),
    user: mongoose.Types.ObjectId(),
    track: mongoose.Types.ObjectId(),
    context: {
      type: 'Album',
      item: mongoose.Types.ObjectId()
    },
    playedAt: Date.now()
  });
  return playHistory;
};

const playHistories = [
  createFakePlayHistory(),
  createFakePlayHistory(),
  createFakePlayHistory()
];

module.exports = {
  createFakePlayHistory,
  playHistories
}