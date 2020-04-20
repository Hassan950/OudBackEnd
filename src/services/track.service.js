const { Track } = require('../models/track.model');
const _ = require('lodash');
const fs = require('fs').promises;
const logger = require('../config/logger');

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
    .lean({ virtuals: true })
    .populate({
      path: 'artists',
      select: 'displayName images'
    })
    .populate({
      path: 'album',
      select: '-tracks -genres -released -release_date',
      populate: { path: 'artists', select: 'displayName images' }
    });
  if (result.length == ids.length) return result;
  const tracks = [];
  for (let i = 0, n = ids.length; i < n; i++) {
    const val = result.find(track => String(track._id) === ids[i]);
    tracks[i] = val ? val : null;
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
      logger.error(err.message);
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
    .lean({ virtuals: true })
    .populate({
      path: 'artists',
      select: 'displayName images'
    })
    .populate({
      path: 'album',
      select: '-tracks -genres -released -release_date',
      populate: { path: 'artists', select: 'displayName images' }
    });
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
      select: 'displayName images'
    })
    .populate({
      path: 'album',
      select: '-tracks -genres -released -release_date',
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
      select: '-tracks -genres -released -release_date',
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
      select: '-tracks -genres -released -release_date',
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
  track.audioUrl = url;
  track.duration = duration;
  await (await track.save())
    .populate({
      path: 'artists',
      select: 'displayName images'
    })
    .populate({
      path: 'album',
      select: '-tracks -genres -released -release_date',
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
  if (track.audioUrl !== 'default.mp3') {
    try {
      await fs.unlink(track.audioUrl);
    } catch (err) {
      logger.error(err.message);
    }
  }
};

/**
 * A method that gets array of tracks of a specific artist
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Get list of tracks of a specific artist
 * @param {String} artistId - ID of the artist
 * @returns {Array} An array containing the tracks of the artist
 */
exports.findArtistTracks = async artistId => {
  return await Track.find({ artists: artistId })
    .populate({
      path: 'artists',
      select: 'displayName images'
    })
    .populate({
      path: 'album',
      select: '-tracks -genres -released -release_date',
      populate: { path: 'artists', select: 'displayName images' }
    });
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
  const tracks = await Track.find({ 'artists.0': artistId });
  if (tracks.length === tracksIds.length) return true;
  return null;
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
exports.getTrackAudioUrl = async (trackId) => {
  const track = await Track.findById(trackId).select('+audioUrl');

  if (!track || !track.audioUrl) return null;

  const audioUrl = track.audioUrl;

  return audioUrl;
};