const { Player } = require('../models');

const getPlayer = async (userId) => {
  const player = await Player.findOne({ userId: userId })
    .populate('item', '-audioUrl')
    .populate('device')
    ;

  return player;
};

const getCurrentlyPlaying = async (userId) => {
  const currentlyPlaying = await Player.findOne({ userId: userId })
    .populate('item', '-audioUrl')
    .select('item context')
    ;

  if (currentlyPlaying && !currentlyPlaying.item) { currentlyPlaying = null; }

  return currentlyPlaying;
};

module.exports = {
  getPlayer,
  getCurrentlyPlaying
}