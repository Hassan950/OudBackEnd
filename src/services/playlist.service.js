const { Playlist, Track, User } = require('../models');
const _ = require('lodash');
const move = require('lodash-move');
const fs = require('fs');

const getPlaylist = async params => {
  const playlist = await Playlist.findById(params.id);
  return playlist;
};

const changePlaylist = async (params, body, image) => {
  let playlist = await Playlist.findByIdAndUpdate(
    params.id,
    {
      $set: {
        name: body.name,
        collabrative: body.collabrative,
        description: body.description,
        public: body.public
      }
    },
    { new: true }
  );
  if (!playlist) return playlist;
  if (!image) return playlist;
  const path = playlist.image;
  if (path != image && path != 'uploads\\default.jpg') {
    fs.unlink(`${path}`, err => {
      if (err) throw err;
    });
  }
  playlist = await Playlist.findByIdAndUpdate(
    params.id,
    {
      image: image
    },
    { new: true }
  );
  return playlist;
};

const uploadImage = async (params, image) => {
  let playlist = await Playlist.findById(params.id);
  if (!playlist) return playlist;
  const path = playlist.image;
  if (path != image && path != 'uploads\\default.jpg') {
    fs.unlink(`${path}`, err => {
      if (err) throw err;
    });
  }
  playlist = await Playlist.findByIdAndUpdate(
    params.id,
    {
      image: image
    },
    { new: true }
  );
  return playlist;
};

const getTracks = async (params, query) => {
  const playlist = await Playlist.findById(params.id);
  if (!playlist) {
    const total = 0;
    const tracks = null;
    return { tracks, total };
  }
  const tracks = await Track.find({ _id: { $in: playlist.tracks } })
    .skip(query.offset)
    .limit(query.limit);
  const total = await Track.find({ _id: { $in: playlist.tracks } }).countDocuments();
  return { tracks, total };
};

const getUserPlaylists = async (params, query) => {
  const playlists = await Playlist.find({ owner: params.id })
    .select('-owner')
    .skip(query.offset)
    .limit(query.limit);
  const total = await Playlist.find({ owner: params.id }).countDocuments();
  return { playlists, total };
};

const getTracksId = async uris => {
  const tracks = await Track.find({ audioUrl: { $in: uris } });
  return tracks;
};

const checkUser = async (id) => {
  const user = await User.findById(id);
  return user;
};

const createUserPlaylist = async (params, body, image) => {
  const playlist = new Playlist({
    name: body.name,
    public: body.public,
    collabrative: body.collabrative,
    description: body.description,
    owner: params.id,
    image: image
  });
  await playlist.save();
  return playlist;
};

const deleteTracks = async (params, tracks) => {
  let playlist = await Playlist.findById(params.id);
  if (!playlist) return playlist;
  playlist = await Playlist.findByIdAndUpdate(params.id, {  $pull: {  'tracks': { $in: tracks }}}, {new: true});
  return playlist;
};

const addTracks = async (params, tracks, position) => {
  let playlist = await Playlist.findById(params.id);
  if (!playlist) return playlist;
  const notFound = [];
  tracks.forEach(element => {
    if (!playlist.tracks.includes(element.id)) {
      notFound.push(element);
    }
  });
  playlist = await Playlist.findByIdAndUpdate(params.id, {
    $push: {
      tracks: {
        $each: notFound,
        $position: position
      }
    }},{
      new: true
    });
  return playlist
}

const reorderTracks = async (params, body) => {
  await Playlist.findOne({ _id: params.id }, { tracks: 1 }).then(async function(
    track
  ) {
    let begin = body.rangeStart;
    let before = body.insertBefore;
    _.times(body.rangeLength, ()=> {
      track.tracks = move.default(track.tracks, begin , before);
      before++;
      begin++;
    });
    await Playlist.updateOne(
      { _id: track._id },
      { $set: { tracks: track.tracks } },
      {
        new: true
      }
    );
  });
};

module.exports = {
  getPlaylist,
  changePlaylist,
  uploadImage,
  getTracks,
  getUserPlaylists,
  createUserPlaylist,
  deleteTracks,
  getTracksId,
  addTracks,
  checkUser,
  reorderTracks
};
