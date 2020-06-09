const { chatService } = require('../services');
const AppError = require('../utils/AppError');
const httpStatus = require('http-status');

/**
 * A middleware that gets the messages' threads of the user in paging object sorted from most frequent modified to least
 *
 * @function
 * @author Hassan Mohamed
 * @summary Get messages' threads
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getChat = async (req, res, next) => {
  const result = await chatService.getChat(req.user._id, req.query);
  if (result instanceof AppError) return next(result);
  res.status(httpStatus.OK).json({
    items: result.data,
    offset: req.query.offset,
    limit: req.query.limit,
    total: result.total
  });
};

/**
 * A middleware that gets a specific thread of the user with its messages
 * wrapped in paging object sorted from most frequent one to least.
 *
 * @function
 * @author Hassan Mohamed
 * @summary Get messages of a thread
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getThread = async (req, res, next) => {
  const result = await chatService.getThread(
    req.user._id,
    req.params.id,
    req.query
  );
  if (result instanceof AppError) return next(result);
  res.status(httpStatus.OK).json({
    result
  });
};

/**
 * A middleware that sends a message to a specific thread of the user.
 *
 * @function
 * @author Hassan Mohamed
 * @summary Send Message to a Thread
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.sendMessage = async (req, res, next) => {
  const result = await chatService.sendMessage(
    req.user._id,
    req.params.id,
    req.body.message
  );
  if (result instanceof AppError) return next(result);
  res.sendStatus(httpStatus.CREATED);
};


/**
 * A middleware that deletes a specific message from a thread
 *
 * @function
 * @author Hassan Mohamed
 * @summary Delete Message From a Thread
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deleteMessage = async (req, res, next) => {
  const result = await chatService.deleteMessage(
    req.user._id,
    req.params.id,
    req.params.messageId
  );
  if (result instanceof AppError) return next(result);
  res.sendStatus(httpStatus.NO_CONTENT);
};
