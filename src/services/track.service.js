const { Track } = require('../models/track.model');
const _ = require('lodash');
const fs = require('fs').promises;
const AppError = require('../utils/AppError');

/**
 * A method that gets array of tracks By their ID's
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Get list of tracks
 * @param {Array<String>} ids - List of ID's of tracks to be retrieved
 * @returns {Array} An array containing the tracks with nulls against unmatched ID's
 */
exports.findTracks = async (ids, user) => {
  const result = await Track.find({ _id: ids })
    .lean({ virtuals: true })
    .populate({
      path: 'artists',
      select: 'displayName images'
    })
    .populate({
      path: 'album',
      select: '-tracks -genres -release_date -album_group',
      populate: { path: 'artists', select: 'displayName images' }
    });
  let val;
  const tracks = ids.map(id => {
    val = result.find(track => String(track._id) === id);
    if (!val) return null;
    if (!val.album.released) {
      if (!user || String(user._id) !== String(val.album.artists[0]._id))
        return null;
    }
    return val;
  });
  return tracks;
};

/**
 * A method that deletes a track by it's ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Deletes a track
 * @param {String} id ID of the track to be deleted
 */
exports.deleteTrack = async id => {
  const track = await Track.findByIdAndDelete(id);
  if (track.audioUrl) {
    try {
      await fs.unlink(track.audioUrl);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
};

/**
 * A method that deletes tracks by their ID's
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Deletes tracks
 * @param {String} ids ID's of the tracks to be deleted
 */
exports.deleteTracks = async ids => {
  await Promise.all(
    ids.map(async id => {
      this.deleteTrack(id);
    })
  );
};

/**
 * A method that gets a track by it's ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary gets a track
 * @param {String} id ID of the track to be retrieved
 * @param {object} user The object of the user if authenticated
 * @returns track if the track was found
 * @returns null the track was not found
 */
exports.findTrack = async (id, user) => {
  const track = await Track.findById(id)
    .lean({ virtuals: true })
    .populate({
      path: 'artists',
      select: 'displayName images'
    })
    .populate({
      path: 'album',
      select: '-tracks -genres -release_date -album_group',
      populate: { path: 'artists', select: 'displayName images' }
    });

  if (!track) return new AppError('The request resource was not found', 404);

  if (!track.album.released) {
    if (!user || String(user._id) !== String(track.album.artists[0]._id))
      return new AppError(
        "You don't have the permission to perform this action",
        403
      );
  }

  return track;
};

/**
 * A method that gets a track by it's ID with its audioUrl it (helper used in other services
 * as it returns a mongoose document not just a json object)
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary gets a track
 * @param {String} id ID of the track to be retrieved
 * @returns track if the track was found
 * @returns null the track was not found
 */
exports.findTrackUtil = async id => {
  const track = await Track.findById(id)
    .populate({
      path: 'artists',
      select: 'displayName images'
    })
    .populate({
      path: 'album',
      select: '-tracks -genres -release_date -album_group',
      populate: { path: 'artists', select: 'displayName images' }
    });
  return track;
};

/**
 * A method that updates a track by it's ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary updates a track
 * @param {String} id ID of the track to be updated
 * @param {object} newTrack object containing the new values
 * @returns Updated track
 */
exports.update = async (id, newTrack) => {
  const track = await Track.findByIdAndUpdate(id, newTrack, {
    new: true
  })
    .lean({ virtuals: true })
    .populate({
      path: 'artists',
      select: 'displayName images'
    })
    .populate({
      path: 'album',
      select: '-tracks -genres -release_date -album_group',
      populate: { path: 'artists', select: 'displayName images' }
    });

  return track;
};

/**
 * A method that creates a track
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary creates a track
 * @param {object} newTrack object containing the new values
 * @returns the new track
 */
exports.createTrack = async (albumId, newTrack) => {
  return await (await Track.create({ ...newTrack, album: albumId }))
    .populate({
      path: 'artists',
      select: 'displayName images'
    })
    .populate({
      path: 'album',
      select: '-tracks -genres -release_date -album_group',
      populate: { path: 'artists', select: 'displayName images' }
    })
    .execPopulate();
};

/**
 * A method that updates the file of a track
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary updates the url of the given track
 * @param {object} track track to be updated
 * @param {string} url the url of the file of the track
 * @returns Updated track
 */
exports.setTrack = async (track, url, duration) => {
  url = url.replace(/\\/g, '/');
  track.audioUrl = url;
  track.duration = duration;
  await (await track.save())
    .populate({
      path: 'artists',
      select: 'displayName images'
    })
    .populate({
      path: 'album',
      select: '-tracks -genres -release_date -album_group',
      populate: { path: 'artists', select: 'displayName images' }
    })
    .execPopulate();
  track = track.toJSON();
  track.albumId = track.album._id;
  return _.omit(track, 'audioUrl');
};

/**
 * A method that checks if a track has an old file that is no longer needed
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Deletes old file of a track
 * @param {ObjectId} id id of the track
 */
exports.checkFile = async id => {
  const track = await Track.findById(id).select('audioUrl');
  if (track.audioUrl) {
    try {
      await fs.unlink(track.audioUrl);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
};

/**
 * A method that Checks if the tracksIds provided belong to the artist.
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Checks if the tracks belong to the artist
 * @param {String} artistId - ID of the artist
 * @param {Array<objectID>} tracksIds ID's of the tracks to check
 * @returns true if they belong to him null if they don't belong to him or doesn't exist
 */
exports.artistTracksExist = async (artistId, tracksIds) => {
  let tracks = await Track.find({
    _id: tracksIds,
    'artists.0': artistId
  }).populate('album');

  if (tracks.length !== tracksIds.length)
    return new AppError(
      "The track ID's given doesn't exist or doesn't belong to this artist",
      400
    );
  for (let i = 0, n = tracks.length; i < n; i++) {
    if (!tracks[i].album.released)
      return new AppError(
        `The track ${tracks[i]._id} is not released, please make sure the tracks are released before adding them to top tracks`,
        400
      );
  }
  if (tracksIds.length < 5) {
    tracks = await Track.find({
      _id: { $nin: tracksIds },
      'artists.0': artistId
    })
      .populate('album')
      .sort({ views: -1 });

    for (let i = 0, n = tracks.length; i < n; i++) {
      if (tracks[i].album.released) {
        tracksIds.push(tracks[i]._id);
        if (tracksIds.length >= 5) break;
      }
    }
  }

  return tracksIds;
};

/**
 * Get Track Audio Url
 *
 * @function
 * @public
 * @async
 * @param {String} trackId Track ID
 * @returns {String} `audioUrl` Audio Url
 * @returns {null} `null` if track is not found or audioUrl is not found
 * @summary Get Track Audio Url
 * @author Abdelrahman Tarek
 */
exports.getTrackAudioUrl = async trackId => {
  const track = await Track.findById(trackId).select('+audioUrl');

  if (!track || !track.audioUrl) return null;

  const audioUrl = track.audioUrl;

  return audioUrl;
};
