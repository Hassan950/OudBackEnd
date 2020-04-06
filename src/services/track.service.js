const { Track } = require('../models/track.model');
const _ = require('lodash');
const fs = require('fs').promises;

/**
 * A method that gets array of tracks By their ID's
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Get list of tracks
 * @param {Array<String>} ids - List of ID's of tracks to be retrieved
 * @returns {Array} An array containing the tracks with nulls against unmatched ID's
 */
exports.findTracks = async ids => {
  const result = await Track.find({ _id: ids })
    .lean()
    .populate({
      path: 'artists',
      select: 'name images'
    })
    .populate({
      path: 'album',
      select: '-tracks -genres -released -release_date',
      populate: { path: 'artists', select: 'name images' }
    });
  if (result.length == ids.length) return result;
  const tracks = [];
  for (let i = 0, n = ids.length; i < n; i++) {
    const val = result.find(track => String(track._id) === ids[i]);
    if (val) {
      tracks[i] = val;
      tracks[i].albumId = tracks[i].album._id;
    } else tracks[i] = null;
  }
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
  if (track.audioUrl !== 'default.mp3') {
    try {
      await fs.unlink(track.audioUrl);
    } catch (err) {
      console.log(err.message);
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
 * @returns track if the track was found
 * @returns null the track was not found
 */
exports.findTrack = async id => {
  const track = await Track.findById(id)
    .lean()
    .populate({
      path: 'artists',
      select: 'name images'
    })
    .populate({
      path: 'album',
      select: '-tracks -genres -released -release_date',
      populate: { path: 'artists', select: 'name images' }
    });
  if (track) track.albumId = track.album._id;
  return track;
};

/**
 * A method that gets a track by it's ID with its audioUrl it (helper used in other services)
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
      select: 'name images'
    })
    .populate({
      path: 'album',
      select: '-tracks -genres -released -release_date',
      populate: { path: 'artists', select: 'name images' }
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
    .lean()
    .populate({
      path: 'artists',
      select: 'name images'
    })
    .populate({
      path: 'album',
      select: '-tracks -genres -released -release_date',
      populate: { path: 'artists', select: 'name images' }
    });
  track.albumId = track.album._id;

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
      select: 'name images'
    })
    .populate({
      path: 'album',
      select: '-tracks -genres -released -release_date',
      populate: { path: 'artists', select: 'name images' }
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
  track.audioUrl = url;
  track.duration = duration;
  await (await track.save())
    .populate({
      path: 'artists',
      select: 'name images'
    })
    .populate({
      path: 'album',
      select: '-tracks -genres -released -release_date',
      populate: { path: 'artists', select: 'name images' }
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
 * @author Mohamed Abo-Bakr@summary Deletes old file of a track
 * @param {ObjectId} id id of the track
 */
exports.checkFile = async id => {
  const track = await Track.findById(id).select('audioUrl');
  if (track.audioUrl !== 'default.mp3') {
    try {
      await fs.unlink(track.audioUrl);
    } catch (err) {
      console.log(err.message);
    }
  }
};

exports.findArtistTracks = async artistId => {
  return await Track.find({ artists: artistId })
    .populate({
      path: 'artists',
      select: 'name images'
    })
    .populate({
      path: 'album',
      select: '-tracks -genres -released -release_date',
      populate: { path: 'artists', select: 'name images' }
    });
};
