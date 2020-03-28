const { Player } = require('../models');

/**
 * Get player with the given userId
 * 
 * @function
 * @async
 * @author Abdelrahman Tarek
 * @param {String} userId User ID 
 * @param {Object} [ops] Options Object
 * @param {Boolean} [ops.populate=false] if true will populate (Default false)
 * @returns player
 * @summary Get player with the given userId
 */
const getPlayer = async (userId, ops = { populate: true }) => {
  let player;

  if (ops.populate) {
    player = await Player.findOne({ userId: userId })
      .populate('item', '-audioUrl')
      .populate('device')
      ;
  } else player = await Player.findOne({ userId: userId });

  return player;
};


/**
 * Get currently playing track with its context
 * 
 * @function
 * @async
 * @author Abdelrahman Tarek
 * @param {String} userId User ID 
 * @param {Object} [ops] Options Object
 * @param {String} [ops.link=undefined] the link of the audio url host if not passed do not return audioUrl
 * @returns {Document} currentlyPlaying if player is found and item is not null 
 * @returns {null} if item is null or player is not found
 * @summary Get Currently Playing
 */
const getCurrentlyPlaying = async (userId, ops = { link: undefined }) => {
  const currentlyPlaying = await Player.findOne({ userId: userId })
    .populate('item')
    .select('item context')
    ;

  if (currentlyPlaying && !currentlyPlaying.item) { currentlyPlaying = null; }

  if (currentlyPlaying && ops.link) {
    const audio = currentlyPlaying.item.audioUrl;
    currentlyPlaying.item.audioUrl = ops.link + audio;
  } else currentlyPlaying.item.audioUrl = undefined;

  return currentlyPlaying;
};

/**
 * Create player with the given userId
 * 
 * @function
 * @async
 * @author Abdelrahman Tarek
 * @param {String} userId User ID 
 * @throws {MongooseError}
 * @returns {Document} newPlayer if player is created
 * @summary Create Player
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