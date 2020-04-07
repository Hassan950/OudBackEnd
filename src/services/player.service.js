const { Player } = require('../models');
const queueService = require('./queue.service');
const trackService = require('./track.service');
const deviceService = require('./device.service');

/**
 * Get player with the given userId
 * 
 * @function
 * @async
 * @author Abdelrahman Tarek
 * @param {String} userId User ID 
 * @param {Object} [ops] Options Object
 * @param {Boolean} [ops.populate=false] if true will populate (Default false)
 * @param {String} [ops.link=undefined] the link of the audio url host if not passed do not return audioUrl if populate is false nothing happens
 * @returns {Document} player
 * @returns {null} if player is not found
 * @summary Get player with the given userId
 */
const getPlayer = async (userId, ops = { populate: true, link: undefined }) => {
  let player;

  if (ops.populate) {
    player = await Player.findOne({ userId: userId })
      .populate({
        path: 'item',
        select: '+audioUrl',
        populate: {
          path: 'artists album',
        }
      })
      .populate('device')
      ;

    if (player && player.item) {
      if (ops.link) {
        // Add host link
        const audio = player.item.audioUrl;
        player.item.audioUrl = ops.link + audio;
      } else
        player.item.audioUrl = undefined;
    }

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
  let currentlyPlaying = await Player.findOne({ userId: userId })
    .populate({
      path: 'item',
      select: '+audioUrl',
      populate: {
        path: 'artists album',
      }
    })
    .select('item context')
    ;

  if (currentlyPlaying && !currentlyPlaying.item) { currentlyPlaying = null; }

  if (currentlyPlaying) {
    if (ops.link) {
      // Add host link
      const audio = currentlyPlaying.item.audioUrl.split('/');
      currentlyPlaying.item.audioUrl = ops.link + audio[audio.length - 1];
    } else
      currentlyPlaying.item.audioUrl = undefined;
  }

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


const addTrackToPlayer = (player, track, context = { type: undefined, id: undefined }) => {
  player.item = track;
  player.positionMs = 0;
  // get context from context uri
  if (context && context.type) {
    player.context = context;
  }
};

const startPlayingFromOffset = async (player, queue, offset, queues) => {
  if (offset.position) {
    if (queues[0].tracks.length > offset.position) {
      player.item = queue.tracks[0];
    } else {
      player.item = queue.tracks[offset.position];
    }
  } else if (offset.uri) {
    const trackId = offset.uri.split(':')[2];
    const pos = await queueService.getTrackPosition(queues[0], trackId);
    if (pos === -1) {
      player.item = queue.tracks[0];
    } else {
      player.item = queue.tracks[pos];
    }
  }

  return player;
};

const changePlayerProgress = async (player, progressMs, queues, track = null) => {
  player.progressMs = progressMs;

  if (!track)
    track = await trackService.findTrack(player.item);

  // if position >= track duration go to next
  if (track && positionMs >= track.duration) {
    if (player.repeatState !== 'track') {
      let queue = await queueService.getQueueById(queues[0], { selectDetails: true });

      if (!queue || !queue.tracks) {
        return null;
      }
      // go next
      queueService.goNext(queue, player);
      // add next track to player
      playerService.addTrackToPlayer(player, queue.tracks[queue.currentIndex], queue.context);
      queue.save(); // save the queue
    } else player.positionMs = 0;
  }

  return player;
};

const addDeviceToPlayer = async (player, deviceId) => {
  const device = await deviceService.getDevice(deviceId);
  if (!device) {
    return null;
  }
  player.device = deviceId;

  return player;
};

const setPlayerToDefault = (player) => {
  player.item = null;
  player.context = { type: 'unknown' };
  player.progressMs = null;
  player.shuffleState = false;
  player.repeatState = 'off';
  player.isPlaying = false;
  player.currentlyPlayingType = 'unknown';
};

module.exports = {
  getPlayer,
  getCurrentlyPlaying,
  createPlayer,
  addTrackToPlayer,
  startPlayingFromOffset,
  changePlayerProgress,
  addDeviceToPlayer,
  setPlayerToDefault,
  addDeviceToPlayer
}