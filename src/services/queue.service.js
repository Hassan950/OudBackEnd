const { Queue, Album, Playlist, Artist } = require('../models');
const trackService = require('./track.service');
const _ = require('lodash');

/**
 * reorder elements in `arr[]` according to given indexes array
 * 
 * @function
 * @private
 * @author Abdelrahman Tarek
 * @param {Array} arr Array to be reordered
 * @param {Array<Number>} indexes Indexes array to to order `arr` with
 * @description Given two arrays of same size, \
 * `arr[]` and `indexes[]`, \
 * reorder elements in `arr[]` according to given indexes array.
 * @summary reorder elements in `arr[]` according to given indexes array.
 * @returns {Array} `arr` After reorder
 * @see https://www.geeksforgeeks.org/reorder-a-array-according-to-given-indexes/
 */
const reorder = (arr, indexes) => {
  let temp = _.range(0, arr.length);

  for (let i = 0; i < arr.length; i++) {
    temp[i] = arr[indexes[i]];
  }

  for (let i = 0; i < arr.length; i++) {
    arr[i] = temp[i];
  }

  return arr;
}

/**
 * Shuffle `arr[]` using Fisher–Yates shuffle Algorithm
 * 
 * @function
 * @private
 * @author Abdelrahman Tarek
 * @param {Array} arr Array to be shuffe
 * @description Shuffle `arr[]` using Fisher–Yates shuffle Algorithm
 * @summary Shuffle `arr[]` using Fisher–Yates shuffle Algorithm
 * @returns {Array} `arr` After shuffle
 * @see https://www.geeksforgeeks.org/shuffle-a-given-array-using-fisher-yates-shuffle-algorithm/
 */
const randomize = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
  }
  return arr;
};

/**
 * Get queue By `id`
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {String} id Queue ID
 * @param {Object} [ops] Options object
 * @param {Boolean} [ops.selectDetails=false] if `true` select (+`currentIndex`, +`shuffleList`, +`shuffleIndex`) from `queue`
 * @param {Boolean} [ops.sort=false] if `true` sort `queue.tracks` with `shuffleList` if found
 * @description Get queue By `id` \
 * if `ops.selectDetails` is `true` select (+`currentIndex`, +`shuffleList`, +`shuffleIndex`) from `queue` \
 * else if `ops.sort` is `true` sort `queue.tracks` with `shuffleList` if found
 * @summary Get queue By `id`
 * @returns {Document} `queue` with the given `id`
 * @returns {null} if `queue` is not found
 */
const getQueueById = async (id, ops = { selectDetails: false, sort: false }) => {
  let queue = Queue.findById(id);

  if (ops && ops.selectDetails) {
    queue.select('+currentIndex +shuffleList +shuffleIndex');
  }
  else if (ops && ops.sort) {

    queue.select('+shuffleList');
    queue = await queue;

    if (queue && queue.tracks &&
      queue.tracks.length && queue.shuffleList &&
      queue.shuffleList.length) {
      // reorder
      queue.tracks = reorder(queue.tracks, queue.shuffleList);
    }

    if (queue)
      queue.shuffleList = undefined;

    return queue;
  }

  return await queue;
};

/**
 * Create queue with the given `context`
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {String} contextUri Context Uri in the form `oud:{type}:{id}`
 * @description Create queue with the given `context` \
 * if something wrong return `null` \
 * accepted `context` `type` is [`album`, `playlist`, `artist`]
 * @summary Create queue with the given `context`
 * @returns {Document} `queue`
 * @returns {null} `null` if something wrong
 */
const createQueueWithContext = async (contextUri) => {
  const uri = contextUri.split(':');
  const type = uri[1];
  const id = uri[2];

  let tracks = [] // fill this array

  if (type === 'album') {
    const album = await Album.findById(id);

    if (!album || !album.tracks || !album.tracks.length) return null;

    tracks = album.tracks;

  } else if (type === 'playlist') {
    const playlist = await Playlist.findById(id);

    if (!playlist || !playlist.tracks || !playlist.tracks.length) return null;

    tracks = playlist.tracks;

  } else if (type === 'artist') {
    const artist = await Artist.findById(id);

    if (!artist || !artist.popularSongs || !artist.popularSongs.length) return null;

    tracks = artist.popularSongs;
  }

  const queue = await Queue.create({
    tracks: tracks,
    context: {
      type: type,
      id: id
    }
  });

  return queue;
};

/**
 * Delete Queue with the given `id`
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {String} id
 * @description Delete Queue with the given `id` 
 * @summary Delete Queue with the given `id` 
 */
const deleteQueueById = async (id) => {
  await Queue.deleteOne({ _id: id });
};

/**
 * Append `tracks[]` to `queue`
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {String} id Queue ID
 * @param {Array<Document>} tracks Tracks Array 
 * @description Append `tracks[]` to `queue` (only unique tracks)
 * @summary Append `tracks[]` to `queue`
 * @returns {Document} queue
 * @returns {null} `null` if `queue` is not found 
 */
const appendToQueue = async (id, tracks) => {
  const queue = await Queue.findById(id).select('+shuffleList');

  if (!queue) return null;

  if (!queue.tracks) queue.tracks = [];

  // unique only
  tracks.forEach(track => {
    const pos = queue.tracks.indexOf(track);
    if (pos === -1)
      queue.tracks.push(track);
  });

  // if queue.tracks.length > queue.shuffleList append to it new tracks indexes
  if (queue.shuffleList && queue.shuffleList.length && queue.tracks.length > queue.shuffleList.length) {
    for (let i = queue.shuffleList.length; i < queue.tracks.length; i++) {
      queue.shuffleList.push(i);
    }
  }

  await queue.save();

  return queue;
};

/**
 * Create `queue` form `tracks[]`
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {Array<Document>} tracks Tracks Array 
 * @description Create `Queue` form 'tracks[]`
 * @summary Create `Queue` form 'tracks[]`
 * @returns {Document} `queue`
 */
const createQueueFromTracks = async (tracks) => {
  const queue = await Queue.create({
    tracks: tracks
  });

  return queue;
};

/**
 * Get `track` position in `queue`
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {String} id Queue ID 
 * @param {String} trackId Track ID 
 * @description Get `track` position in `queue` if not found return `-1`
 * @summary Get `track` position in `queue`
 * @returns {Number} `pos` track postion if `-1` track is not found
 */
const getTrackPosition = async (id, trackId) => {
  const queue = await Queue.findById(id);

  if (!queue || !queue.tracks) return -1;

  const pos = queue.tracks.indexOf(trackId);

  return pos;
};

/**
 * Shuffle `queue`
 * 
 * @function
 * @public
 * @author Abdelrahman Tarek
 * @param {Document} queue Queue
 * @description Shuffle `queue` and set `shuffleIndex` and `shuffleList` 
 * @summary Shuffle `queue`
 * @returns {Document} `queue`
 */
const shuffleQueue = (queue) => {
  let shuffleList = _.range(0, queue.tracks.length);

  shuffleList = randomize(shuffleList);

  let shuffleIndex = shuffleList.indexOf(queue.currentIndex);

  queue.shuffleIndex = shuffleIndex;
  queue.shuffleList = shuffleList;

  return queue;
};

/**
 * Go Next if `player` in shuffle mode
 * 
 * @function
 * @public
 * @author Abdelrahman Tarek
 * @param {Document} queue Queue 
 * @param {Document} player Player 
 * @description Go Next if `player` in shuffle mode \
 * if the playing track is the last track in the `shuffleList` \
 * play the first track if `player.repeatState` is `context` \
 * else go to the next track 
 * @summary Go Next if `player` in shuffle mode
 * @todo add 10 tracks to queue realted to the last track if `player.repeatState` != 'context'
 */
const goNextShuffle = (queue, player) => {
  if (queue.shuffleIndex === queue.tracks.length - 1) { // last track in the queue
    if (player.repeatState === 'context') {
      queue.shuffleIndex = 0; // return to the first track
      queue.currentIndex = queue.shuffleList[queue.shuffleIndex]; // convert shuffleIndex to real index
    } else {
      // TODO 
      // add 10 tracks to queue realted to the last track
    }
  } else { // Go to the next track
    queue.shuffleIndex++;
    queue.currentIndex = queue.shuffleList[queue.shuffleIndex]; // convert shuffleIndex to real index
  }
};

/**
 * Go Next if `player` in Normal mode
 * 
 * @function
 * @public
 * @author Abdelrahman Tarek
 * @param {Document} queue Queue 
 * @param {Document} player Player 
 * @description Go Next if `player` in Normal mode \
 * if the playing track is the last track in the `queue` \
 * play the first track if `player.repeatState` is `context` \
 * else go to the next track 
 * @summary Go Next if `player` in Normal mode
 * @todo add 10 tracks to queue realted to the last track if `player.repeatState` != 'context'
 */
const goNextNormal = (queue, player) => {
  if (queue.currentIndex === queue.tracks.length - 1) { // last track in the queue
    if (player.repeatState === 'context') {
      queue.currentIndex = 0; // return to the first track
    } else {
      // TODO 
      // add 10 tracks to queue realted to the last track
    }
  } else queue.currentIndex++; // Go to the next track
};

/**
 * Go Next
 * 
 * @function
 * @public
 * @author Abdelrahman Tarek
 * @param {Document} queue Queue 
 * @param {Document} player Player
 * @description Go Next \
 * if player is in shuffle mode call `goNextShuffle` \
 * else call `goNextNormal`
 * @summary Go Next
 */
const goNext = (queue, player) => {
  // Shuffle state
  if (player.shuffleState) {
    goNextShuffle(queue, player);
  } else {
    goNextNormal(queue, player);
  }
};

/**
 * Go Previous if `player` in shuffle mode
 * 
 * @function
 * @public
 * @author Abdelrahman Tarek
 * @param {Document} queue Queue 
 * @param {Document} player Player 
 * @description Go Previous if `player` in shuffle mode \
 * if the playing track is the first track in the `shuffleList` \
 * play the last track if `player.repeatState` is `context` \
 * else go to the Previous track 
 * @summary Go Previous if `player` in shuffle mode
 * @todo add 10 tracks to queue realted to the last track if `player.repeatState` != 'context'
 */
const goPreviousShuffle = (queue, player) => {
  if (queue.shuffleIndex === 0) { // first track in the queue
    if (player.repeatState === 'context') {
      queue.shuffleIndex = queue.tracks.length - 1; // return to the last track
      queue.currentIndex = queue.shuffleList[queue.shuffleIndex]; // convert shuffleIndex to real index
    } else {
      // TODO 
      // add 10 tracks to queue realted to the last track
    }
  } else { // Go to the previous track
    queue.shuffleIndex--;
    queue.currentIndex = queue.shuffleList[queue.shuffleIndex]; // convert shuffleIndex to real index
  }
};

/**
 * Go Previous if `player` in Normal mode
 * 
 * @function
 * @public
 * @author Abdelrahman Tarek
 * @param {Document} queue Queue 
 * @param {Document} player Player 
 * @description Go Previous if `player` in Normal mode \
 * if the playing track is the first track in the `queue` \
 * play the last track if `player.repeatState` is `context` \
 * else go to the Previous track 
 * @summary Go Previous if `player` in Normal mode
 * @todo add 10 tracks to queue realted to the last track if `player.repeatState` != 'context'
 */
const goPreviousNormal = (queue, player) => {
  if (queue.currentIndex === 0) { // first track in the queue
    if (player.repeatState === 'context') {
      queue.currentIndex = queue.tracks.length - 1; // return to the last track
    } else {
      // TODO 
      // add 10 tracks to queue realted to the last track
    }
  } else queue.currentIndex--; // Go to the previous track
};

/**
 * Go Previous
 * 
 * @function
 * @public
 * @author Abdelrahman Tarek
 * @param {Document} queue Queue 
 * @param {Document} player Player
 * @description Go Previous \
 * if player is in shuffle mode call `goPreviousShuffle` \
 * else call `goPreviousNormal`
 * @summary Go Previous
 */
const goPrevious = (queue, player) => {
  // Shuffle state
  if (player.shuffleState) {
    goPreviousShuffle(queue, player);
  } else {
    goPreviousNormal(queue, player);
  }

};

/**
 * Fill `Queue` from track Uris
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {Array<String>} uris Uris array in the form `oud:track:{id}`
 * @param {Array<String>} queues queues IDs array
 * @param {Document} player Player
 * @description Fill `Queue` from track Uris \
 * if `queues` is empty \
 * append tracks to the the current `queue` \
 * else create `queue` from tracks
 * @summary Fill `Queue` from track Uris
 * @returns {Document} `queue` 
 */
const fillQueueFromTracksUris = async (uris, queues, player) => {
  let tracks = [];
  for (let i = 0; i < uris.length; i++) {
    const trackId = uris[i].split(':')[2];
    const track = await trackService.findTrack(trackId);
    if (track)
      tracks.push(trackId);
  }

  let queue;
  if (queues && queues.length) {
    queue = await appendToQueue(queues[0], tracks);
  } else {
    queue = await createQueueFromTracks(tracks);
    queues = [queue._id];
    player.item = queue.tracks[0];
    player.context = null;
    player.progressMs = 0;
    player.repeatState = 'off';
    player.shuffleState = false;
    player.isPlaying = true;
  }

  return queue;
};

/**
 * Set `queue` to Default
 * 
 * @function
 * @public
 * @author Abdelrahman Tarek
 * @param {Document} queue Queue
 * @description Set \
 * `queue.currentIndex` to `0` \
 * `queue.shuffleIndex` to `undefined` \
 * `queue.shuffleList` to `undefined`
 * @summary Set `queue` to Default
 */
const setQueueToDefault = (queue) => {
  queue.currentIndex = 0;
  queue.shuffleIndex = undefined;
  queue.shuffleList = undefined;
};


module.exports = {
  fillQueueFromTracksUris,
  goNextNormal,
  goNextShuffle,
  shuffleQueue,
  getTrackPosition,
  createQueueFromTracks,
  appendToQueue,
  deleteQueueById,
  getQueueById,
  createQueueWithContext,
  goNext,
  goPreviousNormal,
  goPreviousShuffle,
  goPrevious,
  setQueueToDefault,
  goPrevious
};