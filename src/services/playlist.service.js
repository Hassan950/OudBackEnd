const { Playlist, Track, User, PlaylistFollowings } = require('../models');
const _ = require('lodash');
const move = require('lodash-move');
const fs = require('fs');

exports.getPlaylist = async params => {
  const playlist = await Playlist.findById(params.id);
  return playlist;
};

exports.changePlaylist = async (params, body, image) => {
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

exports.uploadImage = async (params, image) => {
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

exports.getTracks = async (params, query) => {
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

exports.getUserPlaylists = async (id, query, publicity) => {
    const playlistPromise = PlaylistFollowings.find({ userId: id })
      .where(publicity)
      .populate('playlistId')
      .select('playlistId')
      .select('-_id')
      .skip(query.offset)
      .limit(query.limit)
      .exec();
      let totalPromise;
    if(publicity.public){
    totalPromise = PlaylistFollowings.countDocuments({ userId: id , public: true })
      .exec();
    } 
    else{
    totalPromise = PlaylistFollowings.countDocuments({ userId: id })
      .exec();
    } 
    let [playlists, total] = await Promise.all([
      playlistPromise,
      totalPromise
    ]);
    playlists = _.map(playlists ,playlist => {
      return playlist.playlistId
    })
    return { playlists, total };
};

exports.getTracksId = async uris => {
  const tracks = await Track.find({ audioUrl: { $in: uris } });
  return tracks;
};

exports.checkUser = async id => {
  const user = await User.findById(id);
  return user;
};

exports.createUserPlaylist = async (params, body, image) => {
  const playlist = await Playlist.create({
    name: body.name,
    public: body.public,
    collabrative: body.collabrative,
    description: body.description,
    owner: params.id,
    image: image
  });
  return playlist;
};

exports.deleteTracks = async (params, tracks) => {
  playlist = await Playlist.findByIdAndUpdate(
    params.id,
    { $pull: { tracks: { $in: tracks } } },
    { new: true }
  );
  return playlist;
};

exports.addTracks = async (params, tracks, position) => {
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

exports.reorderTracks = async (params, body) => {
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

