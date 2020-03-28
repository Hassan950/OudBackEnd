const { playHistoryService } = require('../services');
const AppError = require('../utils/AppError.js');

exports.recentlyPlayed = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Must Authenticate user', 500));
  }

  const id = req.user._id;

  const { limit, after, before } = req.query;

  if (after && before) {
    return next(new AppError('If after is specified, before must not be specified.', 400));
  }

  const history = playHistoryService.getHistory(id, { limit, after, before });

  if (history && history.length) {
    res.status(200).json({
      items: history,
      limit: history.length
    });
  } else {
    res.status(204).end();
  }
};