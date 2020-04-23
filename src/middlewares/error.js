const httpStatus = require('http-status');
const multer = require('multer');
const AppError = require('../utils/AppError');
const config = require('config');
const logger = require('./../config/logger');

/**
 * Convert error object to AppError Object
 * 
 * @function
 * @public
 * @author Abdelrahman Tarek
 * @param {Object} err Error object
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Next Function
 */
const errorConverter = (err, req, res, next) => {
  let error = err;
  if (config.get('NODE_ENV') === 'development') {
    logger.error(err);
  }

  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.code === 'ENOENT') error = handleENOENTError(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(error);
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.name === 'InternalOAuthError') error = handleOAuthError(error);
  if (error instanceof multer.MulterError) error = handleMulterError(error);
  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new AppError(message, statusCode, false, err.stack);
  }
  next(error);
};

/**
 * Handle ENOENT Error
 * 
 * @function
 * @private
 * @author Abdelrahman Tarek
 * @param {Object} err Error object
 * @returns {Object} AppError object
 */
const handleENOENTError = err => {
  return new AppError('File Does Not exist', 404);
};

/**
 * Handle OAuth Error
 * 
 * @function
 * @private
 * @author Abdelrahman Tarek
 * @param {Object} err Error object
 * @returns {Object} AppError object
 */
const handleOAuthError = err => {

  return new AppError(err.message, err.oauthError.statusCode ? err.oauthError.statusCode : err.oauthError);
};

/**
 * Handle Cast DB Error
 * 
 * @function
 * @private
 * @author Abdelrahman Tarek
 * @param {Object} err Error object
 * @returns {Object} AppError object
 */
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

/**
 * Handle JWT Error
 * 
 * @function
 * @private
 * @author Abdelrahman Tarek
 * @param {Object} err Error object
 * @returns {Object} AppError object
 */
const handleJWTError = err =>
  new AppError('Invalid Token. Please log in again', 401);

/**
 * Handle JWT Expired Error
 * 
 * @function
 * @private
 * @author Abdelrahman Tarek
 * @param {Object} err Error object
 * @returns {Object} AppError object
 */
const handleJWTExpiredError = err =>
  new AppError('Your token has expired! Please log in again.', 401);

/**
 * Handle Validation Error
 * 
 * @function
 * @private
 * @author Abdelrahman Tarek
 * @param {Object} err Error object
 * @returns {Object} AppError object
 */
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle Duplicate field value Error
 * 
 * @function
 * @private
 * @author Abdelrahman Tarek
 * @param {Object} err Error object
 * @returns {Object} AppError object
 */
const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const field = Object.keys(err.keyValue)[0];
  const message = `Duplicate field: ${field} value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleMulterError = err => {
  return new AppError(err.message, httpStatus.BAD_REQUEST)
}

/**
 * Error handler
 * 
 * @function
 * @public
 * @author Abdelrahman Tarek
 * @param {Object} err Error object
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Next Function
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  if (config.get('NODE_ENV') === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    status: statusCode,
    message,
    ...(config.get('NODE_ENV') === 'development' && {
      stack: err.stack
    })
  };

  if (config.get('NODE_ENV') === 'development') {
    logger.error(err);
  }
  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler
};
