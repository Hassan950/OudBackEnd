const { Playlist, Track, User, PlaylistFollowings } = require('../models');
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
  playlist.image = image;
  await playlist.save();
  return playlist;
};

const getTracks = async (params, query) => {
  const playlist = await Playlist.findById(params.id);
  if (!playlist) {
    const total = 0;
    const tracks = null;
    return { tracks, total };
  }
  const trackPromise = Track.find({ _id: { $in: playlist.tracks } })
    .skip(query.offset)
    .limit(query.limit)
    .exec();
  const totalPromise = Track.countDocuments({
    _id: { $in: playlist.tracks }
  }).exec();
  const [tracks, total] = await Promise.all([trackPromise, totalPromise]);
  return { tracks, total };
};

const getUserPlaylists = async (id, query, self) => {
  if (!self) {
    const playlistPromise = PlaylistFollowings.find({ userId: id })
      .where({ public: true })
      .populate('playlistId')
      .select('playlistId')
      .select('-_id')
      .skip(query.offset)
      .limit(query.limit)
      .exec();
    const totalPromise = PlaylistFollowings.find({ userId: id })
      .where({ public: true })
      .countDocuments()
      .exec();
    const [playlists, total] = await Promise.all([
      playlistPromise,
      totalPromise
    ]);
    let i = 0;
    _.times(total, () => {
      playlists[i] = playlists[i].playlistId;
      i++;
    });
    return { playlists, total };
  } else {
    const playlistPromise = PlaylistFollowings.find({ userId: id })
      .populate('playlistId')
      .select('playlistId')
      .select('-_id')
      .skip(query.offset)
      .limit(query.limit)
      .exec();
    const totalPromise = PlaylistFollowings.find({ userId: id })
      .countDocuments()
      .exec();
    const [playlists, total] = await Promise.all([
      playlistPromise,
      totalPromise
    ]);
    let i = 0;
    _.times(total, () => {
      playlists[i] = playlists[i].playlistId;
      i++;
    });
    return { playlists, total };
  }
};

const getTracksId = async uris => {
  const tracks = await Track.find({ audioUrl: { $in: uris } });
  return tracks;
};

const checkUser = async id => {
  const user = await User.findById(id);
  return user;
};

const createUserPlaylist = async (params, body, image) => {
  const playlist = await Playlist.create({
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
  playlist = await Playlist.findByIdAndUpdate(
    params.id,
    { $pull: { tracks: { $in: tracks } } },
    { new: true }
  );
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
  playlist = await Playlist.findByIdAndUpdate(
    params.id,
    {
      $push: {
        tracks: {
          $each: notFound,
          $position: position
        }
      }
    },
    {
      new: true
    }
  );
  return playlist;
};

const reorderTracks = async (params, body) => {
  const playlist = await Playlist.findOne({ _id: params.id });
  let begin = body.rangeStart;
  let before = body.insertBefore;
  _.times(body.rangeLength, () => {
    playlist.tracks = move.default(playlist.tracks, begin, before);
    before++;
    begin++;
  });
  await playlist.save();
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
