const { Queue, Album, Playlist, Artist } = require('../models');
const { trackService } = require('./');
const _ = require('lodash');

const randomize = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
  }
  return arr;
};


const getQueueById = async (id, ops = { selectDetails: false }) => {
  let queue = Queue.findById(id);

  if (ops && ops.selectDetails) {
    queue.select('+currentIndex +shuffleList +shuffleIndex');
  }

  return await queue;
};

const createQueueWithContext = async (contextUri) => {
  const uri = contextUri.split(':');
  const type = uri[1];
  const id = uri[2];

  let tracks = [] // fill this array

  if (type == 'album') {
    tracks = await Album.findById(id, 'tracks');

    if (!tracks || !tracks.length) return null;

  } else if (type == 'playlist') {
    tracks = await Playlist.findById(id, 'tracks');

    if (!tracks || !tracks.length) return null;

  } else if (type == 'artist') {
    tracks = await Artist.findById(id, 'popularSongs');

    if (!tracks || !tracks.length) return null;

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


const deleteQueueById = async (id) => {
  await Queue.deleteOne(id);
};


const appendToQueue = async (id, tracks) => {
  const queue = await Queue.findById(id);

  if (!queue) return null;

  if (!queue.tracks) queue.tracks = [];

  queue.tracks.push(...tracks);

  await queue.save();

  return queue;
};


const createQueueFromTracks = async (tracks) => {
  const queue = await Queue.create({
    tracks: tracks
  });

  return queue;
};

const getTrackPosition = async (id, trackId) => {
  const queue = await Queue.findById(id);

  if (!queue || !queue.tracks) return -1;

  const pos = queue.tracks.indexOf(trackId);

  return pos;
};

const shuffleQueue = (queue) => {
  let shuffleList = _.range(0, queue.tracks.length);

  shuffleList = randomize(shuffleList);

  let shuffleIndex = shuffleList.indexOf(queue.currentIndex);

  queue.shuffleIndex = shuffleIndex;
  queue.shuffleList = shuffleList;

  return queue;
};

const goNextShuffle = (queue, player) => {
  if (queue.shuffleIndex === queue.tracks.length - 1) { // last track in the queue
    if (player.repeatState === 'context') {
      queue.shuffleIndex = 0; // return to the first track
      queue.currentIndex = queue.shuffleList[queue.shuffleIndex]; // convert shuffleIndex to real index
    } else if (player.repeatState === 'off') {
      // TODO 
      // add 10 tracks to queue realted to the last track
    }
  } else { // Go to the next track
    queue.shuffleIndex++;
    queue.currentIndex = queue.shuffleList[queue.shuffleIndex]; // convert shuffleIndex to real index
  }
};

const goNextNormal = (queue, player) => {
  if (queue.currentIndex === queue.tracks.length - 1) { // last track in the queue
    if (player.repeatState === 'context') {
      queue.currentIndex = 0; // return to the first track
    } else if (player.repeatState === 'off') {
      // TODO 
      // add 10 tracks to queue realted to the last track
    }
  } else queue.currentIndex++; // Go to the next track
};

const goNext = (queue, player) => {
  // Shuffle state
  if (player.shuffleState) {
    goNextShuffle(queue, player);
  } else {
    goNextNormal(queue, player);
  }
};

const goPreviousShuffle = (queue, player) => {
  if (queue.shuffleIndex === 0) { // first track in the queue
    if (player.repeatState === 'context') {
      queue.shuffleIndex = queue.tracks.length - 1; // return to the last track
      queue.currentIndex = queue.shuffleList[queue.shuffleIndex]; // convert shuffleIndex to real index
    } else if (player.repeatState === 'off') {
      // TODO 
      // add 10 tracks to queue realted to the last track
    }
  } else { // Go to the previous track
    queue.shuffleIndex--;
    queue.currentIndex = queue.shuffleList[queue.shuffleIndex]; // convert shuffleIndex to real index
  }
};

const goPreviousNormal = (queue, player) => {
  if (queue.currentIndex === 0) { // first track in the queue
    if (player.repeatState === 'context') {
      queue.currentIndex = queue.tracks.length - 1; // return to the last track
    } else if (player.repeatState === 'off') {
      // TODO 
      // add 10 tracks to queue realted to the last track
    }
  } else queue.currentIndex--; // Go to the previous track
};

const goPrevious = (queue, player) => {
  // Shuffle state
  if (player.shuffleState) {
    goPreviousShuffle(queue, player);
  } else {
    goPreviousNormal(queue, player);
  }

};

const fillQueueFromTracksUris = async (uris, queues, player) => {
  let tracks = [];
  uris.forEach(async uri => {
    const trackId = uri.split(':')[2];
    const track = await trackService.findTrack(trackId);
    if (track)
      tracks.push(trackId);
  });
  let queue;
  if (queues && queues.length) {
    queue = await appendToQueue(queues[0], tracks);
  } else {
    queue = await createQueueFromTracks(tracks);
    queues = [queue._id];
    player.item = queue.tracks[0];
    player.context = null;
    player.positionMs = 0;
  }

  return queue;
};

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