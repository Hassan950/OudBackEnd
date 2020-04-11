/**
 * @author Abdelrahman Tarek
 * @class
 * @extends {Error}
 */
class AppError extends Error {
  /**
   * @constructor
   * @author Abdelrahman Tarek
   * @param {String} message Error message
   * @param {Number} statusCode Error status code
   * @param {Boolean} [isOperational=true] `true` if the error is operational (default `true`)
   * @param {String} [stack] Error stack 
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