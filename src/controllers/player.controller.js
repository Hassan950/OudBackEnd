const { playerService } = require('../services');
const AppError = require('../utils/AppError.js');

/**
 * @version 1.0.0
 * @throws AppError 500 status
 * @author Abdelrahman Tarek
 * @description get user`s player
 * @summary User player
 */
exports.getPlayer = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Must Authenticate user', 500));
  }

  const id = req.user._id;

  const player = await playerService.getPlayer(id);

  if (!player) {
    res.status(204);
    return res.end();
  }

  res.status(200).json({
    player: player
  });
};


/**
 * @version 1.0.0
 * @throws AppError 500 status
 * @author Abdelrahman Tarek
 * @description get user`s currently playing track
 * @summary User Currently Playing track
 */
exports.getCurrentlyPlaying = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Must Authenticate user', 500));
  }

  const id = req.user._id;

  const currentlyPlaying = await playerService.getCurrentlyPlaying(id);

  if (!currentlyPlaying) {
    res.status(204);
    return res.end();
  }

  res.status(200).json({
    track: currentlyPlaying.item,
    context: currentlyPlaying.context
  })
};