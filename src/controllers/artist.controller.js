const { artistService, albumService } = require('../services');
const AppError = require('../utils/AppError');

/**
 * A middleware that gets the Artist with the given ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Gets an artist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the artist doesn't exist
 */
exports.getArtist = async (req, res, next) => {
  const artist = await artistService.findArtist(req.params.id);
  if (!artist)
    return next(new AppError('The requested resource was not found', 404));
  res.status(200).json(artist);
};

/**
 * A middleware that gets the artists with the given ID's
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Gets several artists
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getArtists = async (req, res, next) => {
  const artists = await artistService.findArtists(req.query.ids);
  res.status(200).json({
    artists: artists
  });
};

/**
 * A middleware that gets the albums of the artist with the given ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Gets the albums of an artist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAlbums = async (req, res, next) => {
  const albums = await albumService.findArtistAlbums(
    req.params.id,
    req.query.limit,
    req.query.offset
  );

  res.status(200).json({
    limit: req.query.limit,
    offset: req.query.offset,
    total: albums[1],
    items: albums[0]
  });
};

/**
 * A middleware that gets the popular tracks of the artist with the given ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Gets the popular tracks of an artist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getTracks = async (req, res, next) => {
  const tracks = await artistService.getPopularSongs(req.params.id);
  if (!tracks)
    return next(new AppError('The requested resource was not found', 404));
  res.status(200).json({
    tracks: tracks
  });
};

/**
 * A middleware that gets the related artists of the artist with the given ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Gets the related artists of an artist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the artist doesn't exist
 */
exports.relatedArtists = async (req, res, next) => {
  const artists = await artistService.relatedArtists(req.params.id);
  if (!artists)
    return next(new AppError('The requested resource was not found', 404));
  res.status(200).json({
    artists: artists
  });
};

/**
 * A middleware that updates the current artist's data
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Updates the current artist's data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateArtist = async (req, res, next) => {
  const artist = await artistService.update(req.user, req.body);

  if (!artist)
    return next(
      new AppError(
        "The tracks given do not exist or doesn't belong to this artist",
        400
      )
    );
  res.status(200).json({
    artist: artist
  });
};
