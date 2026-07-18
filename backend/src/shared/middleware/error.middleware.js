const { logger } = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
  logger.error(err, `Exception intercepted on [${req.method}] ${req.url}`);

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "An unexpected operational failure occurred.";
  const messages = err.messages || { en: message, ar: message };

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message,
      messages: messages,
      ...(err.details && { details: err.details }),
    },
  });
};

module.exports = errorMiddleware;
const notFoundMiddleware = (req, res, next) => {
  const error = new Error(`Route [${req.method}] ${req.url} not found`);
  error.statusCode = 404;
  error.code = "NOT_FOUND";
  next(error);
};

module.exports = {
  errorMiddleware,
  notFoundMiddleware,
};
