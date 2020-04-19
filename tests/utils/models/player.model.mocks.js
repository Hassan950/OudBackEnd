const { Player } = require('../../../src/models');
const mongoose = require('mongoose');
const faker = require('faker');
const _ = require('lodash');

const createFakePlayer = () => {
  const player = new Player({
    device: mongoose.Types.ObjectId(),
    userId: mongoose.Types.ObjectId(),
    progressMs: faker.random.number(),
    isPlaying: false,
    shuffleState: false,
    repeatState: 'off',
    currentlyPlayingType: 'track',
    item: mongoose.Types.ObjectId(),
    context: {
      type: 'album',
      id: mongoose.Types.ObjectId()
    }
  });
  return player;
};

const players = [
  createFakePlayer(),
  createFakePlayer(),
  createFakePlayer()
];

module.exports = {
  createFakePlayer,
  players
}