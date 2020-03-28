const { PlayHistory } = require('../../../src/models');
const mongoose = require('mongoose');

const createFakePlayHistory = () => {
  const playHistory = new PlayHistory({
    user: mongoose.Types.ObjectId(),
    track: mongoose.Types.ObjectId(),
    context: {
      type: 'album',
      id: mongoose.Types.ObjectId()
    }
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