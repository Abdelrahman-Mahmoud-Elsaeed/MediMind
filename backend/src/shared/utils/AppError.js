class AppError extends Error {
  constructor(message, statusCode, code, messages = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.messages = messages;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
