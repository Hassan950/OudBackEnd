const { Player } = require('../models');

/**
 * Get player with the given userId
 * 
 * @function
 * @author Abdelrahman Tarek
 * @param {String} userId 
 * @returns player
 */
const getPlayer = async (userId) => {
  const player = await Player.findOne({ userId: userId })
    .populate('item', '-audioUrl')
    .populate('device')
    ;

  return player;
};


/**
 * Get currently playing track with its context
 * 
 * @function
 * @author Abdelrahman Tarek
 * @param {String} userId 
 * @returns currentlyPlaying if player is found and item is not null 
 * @returns {null} if item is null or player is not found
 */
const getCurrentlyPlaying = async (userId) => {
  const currentlyPlaying = await Player.findOne({ userId: userId })
    .populate('item', '-audioUrl')
    .select('item context')
    ;

  if (currentlyPlaying && !currentlyPlaying.item) { currentlyPlaying = null; }

  return currentlyPlaying;
};

/**
 * Create player with the given userId
 * 
 * @function
 * @author Abdelrahman Tarek
 * @param {String} userId 
 * @returns newPlayer
 */
const createPlayer = async (userId) => {
  const newPlayer = await Player.create({
    userId: userId
  });

  return newPlayer;
};

module.exports = {
  getPlayer,
  getCurrentlyPlaying,
  createPlayer
}