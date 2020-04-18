const { Artist, User, Track, Request } = require('../models');
const _ = require('lodash');
const { trackService, emailService } = require('../services');
const logger = require('../config/logger');

/**
 * A method that gets an artist by it's ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary gets an artist
 * @param {String} id ID of the artist to be retrieved
 * @returns artist if the artist was found
 * @returns null if the artist was not found
 */
exports.findArtist = async id => {
  const artist = await User.findById(id)
    .select('displayName images genres bio popularSongs type')
    .populate({
      path: 'popularSongs',
      populate: { path: 'album', select: '-tracks' }
    })
    .populate('genres');

  return artist;
};

/**
 * A method that gets an array of artists by their ID's
 *
 * @function
 * @summary Get a list of artists
 * @param {Array<String>} ids - List of ID's of artists to be retrieved
 * @returns {Array} An array containing the artists with nulls against unmatched ID's
 */
exports.findArtists = async ids => {
  const result = await User.find({ _id: ids })
    .select('displayName images genres bio popularSongs type')
    .populate({
      path: 'popularSongs',
      populate: { path: 'album', select: '-tracks' }
    })
    .populate('genres');
  const artists = ids.map(id => {
    return result.find(artist => String(artist._id) === id);
  });
  return artists;
};

/**
 * A method that returns popular songs of a specific artist
 *
 * @function
 * @summary Gets popular songs of an artist
 * @param {String} artistId Id of the artist
 * @returns {Array<Object>} array of popular songs of the artist up to 10
 * @returns null if the artist has no popular songs or the ID doesn't belong to any artist
 */
exports.getPopularSongs = async artistId => {
  const artist = await User.findById(artistId)
    .populate({
      path: 'popularSongs',
      populate: { path: 'album', select: '-tracks' }
    })
    .select('popularSongs');

  if (!artist) return null;
  if (artist.popularSongs.length === 0) {
    artist.popularSongs = await Track.find({ 'artists.0': artistId })
      .sort({
        views: -1
      })
      .populate({ path: 'album', select: '-tracks -genres' })
      .limit(10);
  }
  return artist.popularSongs;
};

/**
 * A method that returns related artists to a specific artist
 *
 * @function
 * @summary Gets related artists of an artist
 * @param {String} artistId Id of the artist
 * @returns {Array<Object>} array of artists related to the artist
 * @returns null if the ID doesn't belong to any artist
 */
exports.relatedArtists = async artistId => {
  const artist = await User.findById(artistId);

  if (!artist) return null;

  const artists = await User.find({
    genres: { $in: artist.genres }
  })
    .select('displayName images genres bio popularSongs type')
    .limit(20)
    .populate({
      path: 'popularSongs',
      populate: { path: 'album', select: '-tracks' }
    })
    .populate('genres');
  return artists;
};

/**
 * A method that checks if the list of artists exist
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Checks if the list of artists exist
 * @param {Array<ObjectId>} artistsIds ID's to check
 * @returns true if they exist
 * @returns false if they don't exist
 */
exports.artistsExist = async artistIds => {
  const artists = await Artist.find({ _id: artistIds });
  if (artistIds.length !== artists.length) return false;
  return true;
};

/**
 * A method that updates the current artist's data
 *
 * @function
 * @author MOhamed Abo-Bakr
 * @summary Updates the current artist's data
 * @param {object} artist the current artist
 * @param {object} newData the new data
 * @returns The updated artist
 */
exports.update = async (artist, newData) => {
  if (newData.bio) artist.bio = newData.bio;
  if (newData.tracks) {
    const exist = await trackService.ArtistTracksExist(
      artist._id,
      newData.tracks
    );

    if (!exist) return null;
    artist.popularSongs = newData.tracks;
  }
  await (await artist.save())
    .populate({
      path: 'popularSongs',
      populate: { path: 'album', select: '-tracks' }
    })
    .populate('genres')
    .execPopulate();

  return _.pick(artist, [
    '_id',
    'genres',
    'images',
    'displayName',
    'bio',
    'popularSongs'
  ]);
};

/**
 * A method that creates an artist request
 *
 * @function
 * @author MOhamed Abo-Bakr
 * @summary creates an artist request with the given data
 * @param {object} requestData the data of the request
 */
exports.createRequest = async requestData => {
  return await Request.create(requestData);
};

/**
 * A method that deletes a request
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Deletes a request
 * @param {string} requestId the ID of the request
 * @returns null if the request was not found
 */
exports.deleteRequest = async requestId => {
  await Request.findByIdAndDelete(requestId);
};

/**
 * A method that gets a request
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary gets a request
 * @param {string} requestId the ID of the request
 * @returns null if the request was not found
 */
exports.getRequest = async requestId => {
  return await Request.findById(requestId);
};

/**
 * A method that sets the attachment of a request
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary sets the attachment of a request
 * @param {object} requestId the request
 * @param {string} path path of the uploaded file
 * @returns null if the request was not found
 */
exports.setAttachment = async (request, path) => {
  request.attachment = path;
  await request.save();
};

/**
 * A method that handles accepted request
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Handles accepted requests
 * @param {object} request The request
 * @returns created artist
 */
exports.acceptRequest = async request => {
  await Artist.create({
    displayName: request.displayName,
    username: request.name,
    email: request.email,
    password: '12341234',
    passwordConfirm: '12341234',
    genres: request.genres,
    bio: request.bio,
    country: request.country
  });
  await this.deleteRequest(request._id);
  const message =
    `Congratulations, we are sending this email to inform you that your request to be an artist is accepted \n ` +
    `you can now log in to Oud website with: <br> email: ${request.email} <br> password: 12341234 <br> ` +
    `You can then change your password and let the world hear you.`;

  emailService
    .sendEmail({
      email: request.email,
      subject: 'Your request to be an artist',
      message,
      button: 'Oud',
      link: 'https://oud-zerobase.me'
    })
    .then()
    .catch(error => {
      logger.error(`${error.code} :${error.message}`);
    });
};

/**
 * A method that handles refused requests
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Handles refused requests
 * @param {object} request The request
 */
exports.refuseRequest = async request => {
  await this.deleteRequest(request._id);
  const message = `We are sorry to inform you that your request has been refused as your data doesn't match our specifications for an artist`;

  emailService
    .sendEmail({
      email: request.email,
      subject: 'Your request to be an artist',
      message,
      button: 'Oud',
      link: 'https://oud-zerobase.me'
    })
    .then()
    .catch(error => {
      logger.error(`${error.code} :${error.message}`);
    });
};
