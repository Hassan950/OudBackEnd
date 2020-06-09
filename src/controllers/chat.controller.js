const { chatService } = require('../services');
const AppError = require('../utils/AppError');
const httpStatus = require('http-status');

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

exports.getThread = async (req, res, next) => {
  const result = await chatService.getThread(req.user._id, req.params.id, req.query);
  if (result instanceof AppError) return next(result);
  res.status(httpStatus.OK).json({
    result
  });
};

exports.sendMessage = async (req, res, next) => {
  const result = await chatService.sendMessage(
    req.user._id,
    req.params.id,
    req.body.message
  );
  if (result instanceof AppError) return next(result);
  res.sendStatus(httpStatus.CREATED);
};

exports.deleteMessage = async (req, res, next) => {
  const result = await chatService.deleteMessage(
    req.user._id,
    req.params.id,
    req.params.messageId
  );
  if (result instanceof AppError) return next(result);
  res.sendStatus(httpStatus.NO_CONTENT);
};
