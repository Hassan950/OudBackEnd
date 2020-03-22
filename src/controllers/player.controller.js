const { playerService } = require('../services');
const AppError = require('../utils/AppError.js');

exports.getPlayer = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Must Authenticate user', 500));
  }

  const id = req.user._id;

  const player = await playerService.getPlayer(id);

  res.status(200).json({
    player: player
  });
};