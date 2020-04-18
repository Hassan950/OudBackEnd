const { Queue, Album, Playlist, Artist, Track } = require('../models');
const trackService = require('./track.service');
const playerService = require('./player.service');
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

    if (!artist) return null;

    tracks = await getArtistTopTracksQueue(artist);
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
 * Get artist top tracks to create queue with
 * 
 * @function
 * @private
 * @async
 * @author Abdelrahman Tarek
 * @summary Get artist top tracks to create queue with
 * @param {Document} artist artist
 * @returns {Array<String>} artist top tracks
 */
const getArtistTopTracksQueue = async (artist) => {
  // get top 10 tracks by views
  let topTracks = await Track.find({ 'artists.0': artist._id })
    .sort({
      views: -1
    })
    .limit(10);
  // select only _id
  topTracks = topTracks.map(track => track._id);
  // if popularSongs is empty use top tracks
  if (!artist.popularSongs || !artist.popularSongs.length)
    artist.popularSongs = topTracks;
  else {
    // append topTracks and popularSongs then unique the result
    artist.popularSongs = _.uniq(_.union(artist.popularSongs, topTracks));
  }

  return artist.popularSongs;
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
 * @async
 * @author Abdelrahman Tarek
 * @param {Document} queue Queue 
 * @param {Document} player Player 
 * @param {Array<String>} queues User queues
 * @description Go Next if `player` in shuffle mode \
 * if the playing track is the last track in the `shuffleList` \
 * play the first track if `player.repeatState` is `context` \
 * else go to the next track 
 * @summary Go Next if `player` in shuffle mode
 * @returns {Document} queue
 */
const goNextShuffle = async (queue, player, queues) => {
  if (queue.shuffleIndex === queue.tracks.length - 1) { // last track in the queue
    if (player.repeatState === 'context') {
      queue.shuffleIndex = 0; // return to the first track
      queue.currentIndex = queue.shuffleList[queue.shuffleIndex]; // convert shuffleIndex to real index
    } else {
      // create a queue similar to the current queue
      const userService = require('./user.service');

      let newQueue = await createSimilarQueue(queue);

      if (!newQueue || !newQueue.tracks || !newQueue.tracks.length)
        return queue;

      queue = newQueue;

      playerService.setPlayerToDefault(player);
      queues = await userService.addQueue(queue, queues);
    }
  } else { // Go to the next track
    queue.shuffleIndex++;
    queue.currentIndex = queue.shuffleList[queue.shuffleIndex]; // convert shuffleIndex to real index
  }

  return queue;
};

/**
 * Go Next if `player` in Normal mode
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {Document} queue Queue 
 * @param {Document} player Player 
 * @param {Array<String>} queues User queues
 * @description Go Next if `player` in Normal mode \
 * if the playing track is the last track in the `queue` \
 * play the first track if `player.repeatState` is `context` \
 * else go to the next track 
 * @summary Go Next if `player` in Normal mode
 * @returns {Document} queue
 */
const goNextNormal = async (queue, player, queues) => {
  if (queue.currentIndex === queue.tracks.length - 1) { // last track in the queue
    if (player.repeatState === 'context') {
      queue.currentIndex = 0; // return to the first track
    } else {
      // create a queue similar to the current queue
      const userService = require('./user.service');

      let newQueue = await createSimilarQueue(queue);

      if (!newQueue || !newQueue.tracks || !newQueue.tracks.length)
        return queue;

      queue = newQueue;

      playerService.setPlayerToDefault(player);
      queues = await userService.addQueue(queue, queues);
    }
  } else queue.currentIndex++; // Go to the next track

  return queue;
};

/**
 * Go Next
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {Document} queue Queue 
 * @param {Document} player Player
 * @param {Array<String>} queues User queues
 * @description Go Next \
 * if player is in shuffle mode call `goNextShuffle` \
 * else call `goNextNormal`
 * @summary Go Next
 * @returns {Document} queue
 */
const goNext = async (queue, player, queues) => {
  // Shuffle state
  if (player.shuffleState) {
    return await goNextShuffle(queue, player, queues);
  } else {
    return await goNextNormal(queue, player, queues);
  }
};

/**
 * Go Previous if `player` in shuffle mode
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {Document} queue Queue 
 * @param {Document} player Player 
 * @param {Array<String>} queues User queues
 * @description Go Previous if `player` in shuffle mode \
 * if the playing track is the first track in the `shuffleList` \
 * play the last track if `player.repeatState` is `context` \
 * else go to the Previous track 
 * @summary Go Previous if `player` in shuffle mode
 * @returns {Document} queue
 */
const goPreviousShuffle = async (queue, player, queues) => {
  if (queue.shuffleIndex === 0) { // first track in the queue
    if (player.repeatState === 'context') {
      queue.shuffleIndex = queue.tracks.length - 1; // return to the last track
      queue.currentIndex = queue.shuffleList[queue.shuffleIndex]; // convert shuffleIndex to real index
    } else {
      // play the last queue
      if (queues && queues.length > 1) {
        queues.reverse();
        queue = await queueService.getQueueById(queues[0], { selectDetails: true });
        setQueueToDefault(queue);
        playerService.setPlayerToDefault(player);
      }
    }
  } else { // Go to the previous track
    queue.shuffleIndex--;
    queue.currentIndex = queue.shuffleList[queue.shuffleIndex]; // convert shuffleIndex to real index
  }

  return queue;
};

/**
 * Go Previous if `player` in Normal mode
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {Document} queue Queue 
 * @param {Document} player Player 
 * @param {Array<String>} queues User queues
 * @description Go Previous if `player` in Normal mode \
 * if the playing track is the first track in the `queue` \
 * play the last track if `player.repeatState` is `context` \
 * else go to the Previous track 
 * @summary Go Previous if `player` in Normal mode
 * @returns {Document} queue
 */
const goPreviousNormal = async (queue, player, queues) => {
  if (queue.currentIndex === 0) { // first track in the queue
    if (player.repeatState === 'context') {
      queue.currentIndex = queue.tracks.length - 1; // return to the last track
    } else {
      // play the last queue
      if (queues && queues.length > 1) {
        queues.reverse();
        queue = await getQueueById(queues[0], { selectDetails: true });
        setQueueToDefault(queue);
        playerService.setPlayerToDefault(player);
      }
    }
  } else queue.currentIndex--; // Go to the previous track

  return queue;
};

/**
 * Go Previous
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {Document} queue Queue 
 * @param {Document} player Player
 * @param {Array<String>} queues User queues
 * @description Go Previous \
 * if player is in shuffle mode call `goPreviousShuffle` \
 * else call `goPreviousNormal`
 * @summary Go Previous
 * @returns {Document} queue
 */
const goPrevious = async (queue, player, queues) => {
  // Shuffle state
  if (player.shuffleState) {
    return await goPreviousShuffle(queue, player, queues);
  } else {
    return await goPreviousNormal(queue, player, queues);
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
    queues.push(queue._id);

    playerService.setPlayerToDefault(player);
    playerService.addTrackToPlayer(player, queue.tracks[0]);
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

/**
 * Create queue similar to the current queue 
 * 
 * @function
 * @private
 * @async
 * @author Abdelrahman Tarek
 * @param {Document} queue 
 * @description Create queue similar to the current queue 
 * @summary Create queue similar to the current queue 
 * @returns {Document} newQueue
 */
const createSimilarQueue = async (queue) => {
  const context = queue.context.type;
  const id = queue.context.id;
  let newQueue;
  if (context === 'artist') {
    // create a queue from realted artists
    newQueue = await createQueueFromRelatedArtists(id);
  } else if (context === 'album') {
    // create a queue from artist albums
    newQueue = await createQueueFromRelatedAlbums(id);
  } else if (context === 'playlist') {
    // create a queue from a similar playlist
    newQueue = await createQueueFromRelatedPlaylists(id);
  } else {
    // create a queue from a similar playlist
    newQueue = await createQueueFromListOfTracks(queue.tracks);
  }

  return newQueue;
};


/**
 * Create queue from related artists
 * 
 * @function
 * @private
 * @async
 * @author Abdelrahman Tarek
 * @param {String} artistId 
 * @returns {Document} queue
 */
const createQueueFromRelatedArtists = async (artistId) => {
  let artist = await Artist.findById(artistId);

  if (!artist) return null;

  // get realted artists
  const artists = await Artist.aggregate([
    { $match: { genres: { $in: artist.genres }, _id: { $ne: artistId } } },
    { $limit: 20 }
  ]);

  if (!artists || !artists.length) return null;

  // get random number from 0 to artists.length - 1
  const index = Math.floor(Math.random() * artists.length);
  // get the random artist
  artist = artists[index];

  // get artist top tracks to create the queue with
  const tracks = await getArtistTopTracksQueue(artist);

  if (!tracks || !tracks.length) return null;

  // create new queue
  return await Queue.create({
    tracks: tracks,
    context: {
      type: 'artist',
      id: artist._id
    }
  });
};

/**
 * Create queue from related Albums
 * 
 * @function
 * @private
 * @async
 * @author Abdelrahman Tarek
 * @param {String} albumId 
 * @returns {Document} queue
 */
const createQueueFromRelatedAlbums = async (albumId) => {
  let album = await Album.findById(albumId);

  if (!album) return null;

  // get realted albums
  const albums = await Album.aggregate([
    {
      $match: {
        $or: [
          { genres: { $in: album.genres } },
          { artists: { $in: album.artists } }
        ],
        _id: { $ne: albumId },
        released: true
      }
    },
    { $limit: 20 }
  ]);

  if (!albums || !albums.length) return null;

  // get random number from 0 to albums.length - 1
  const index = Math.floor(Math.random() * albums.length);
  // get the random artist
  album = albums[index];

  // get album tracks
  const tracks = album.tracks;

  if (!tracks || !tracks.length) return null;

  // create new queue
  return await Queue.create({
    tracks: tracks,
    context: {
      type: 'album',
      id: album._id
    }
  });
};


/**
 * Create queue from related Playlists
 * 
 * @function
 * @private
 * @async
 * @author Abdelrahman Tarek
 * @param {String} playlistId Playlist ID
 * @returns {Document} queue
 */
const createQueueFromRelatedPlaylists = async (playlistId) => {
  let playlist = await Playlist.findById(playlistId);

  if (!playlist) return null;

  const playlists = await Playlist.aggregate([
    {
      $match: {
        tracks: { $in: playlist.tracks },
        public: true,
        _id: { $ne: playlistId }
      }
    },
    { $limit: 20 }
  ]);

  if (!playlists || !playlists.length) return null;

  // get random number from 0 to albums.length - 1
  const index = Math.floor(Math.random() * playlists.length);
  // get the random artist
  playlist = playlists[index];

  // get album tracks
  const tracks = playlist.tracks;

  if (!tracks || !tracks.length) return null;

  // create new queue
  return await Queue.create({
    tracks: tracks,
    context: {
      type: 'playlist',
      id: playlist._id
    }
  });
};

/**
 * Create queue from list of tracks
 * 
 * @function
 * @private
 * @async
 * @author Abdelrahman Tarek
 * @param {Array<String>} tracks Tracks array
 * @returns {Document} queue
 */
const createQueueFromListOfTracks = async (tracks) => {
  const playlists = await Playlist.aggregate([
    {
      $match: {
        tracks: { $in: tracks },
        public: true
      }
    },
    { $limit: 20 }
  ]);

  if (!playlists || !playlists.length) return null;

  // get random number from 0 to albums.length - 1
  const index = Math.floor(Math.random() * playlists.length);
  // get the random artist
  playlist = playlists[index];

  // get album tracks
  tracks = playlist.tracks;

  if (!tracks || !tracks.length) return null;

  // create new queue
  return await Queue.create({
    tracks: tracks,
    context: {
      type: 'playlist',
      id: playlist._id
    }
  });
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