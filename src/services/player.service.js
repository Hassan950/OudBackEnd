const { Player } = require('../models');

const getPlayer = async (userId) => {
  const player = await Player.findOne({ userId: userId })
    .populate('item', '-audioUrl')
    .populate('device')
    ;

  return player;
};


module.exports = {
  getPlayer
}