class AppError extends Error {
  /**
   * 
   * @param {String} message
   * @param {Number} statusCode
   */
  constructor(message, statusCode, isOperational = true, stack = '') {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    }
    else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = AppError;