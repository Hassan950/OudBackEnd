const { Queue, Album, Playlist, Artist } = require('../models');
const _ = require('lodash');

const randomize = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
  }
  return arr;
};


exports.getQueueById = async (id, ops = { selectDetails: false }) => {
  let queue = Queue.findById(id);

  if (ops && ops.selectDetails) {
    queue.select('+currentIndex +shuffleList +shuffleIndex');
  }

  await queue;

  return queue;
};

exports.createQueueWithContext = async (contextUri) => {
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


exports.deleteQueueById = async (id) => {
  await Queue.deleteOne(id);
};


exports.appendToQueue = async (id, tracks) => {
  const queue = await Queue.findById(id);

  if (!queue) return null;

  if (!queue.tracks) queue.tracks = [];

  queue.tracks.push(...tracks);

  await queue.save();

  return queue;
};


exports.createQueueFromTracks = async (tracks) => {
  const queue = await Queue.create({
    tracks: tracks
  });

  return queue;
};

exports.getTrackPosition = async (id, trackId) => {
  const queue = await Queue.findById(id);

  if (!queue || !queue.tracks) return -1;

  const pos = queue.tracks.indexOf(trackId);

  return pos;
};

exports.shuffleQueue = (queue) => {
  let shuffleList = _.range(0, queue.tracks.length);

  shuffleList = randomize(shuffleList);

  let shuffleIndex = shuffleList.indexOf(queue.currentIndex);

  queue.shuffleIndex = shuffleIndex;
  queue.shuffleList = shuffleList;

  return queue;
};