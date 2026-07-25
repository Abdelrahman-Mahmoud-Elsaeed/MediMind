const { logger } = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
  logger.error(err, `Exception intercepted on [${req.method}] ${req.url}`);

  const isAppError = err.statusCode && err.code;
  const statusCode = isAppError ? err.statusCode : 500;
  const errorCode = isAppError ? err.code : "INTERNAL_SERVER_ERROR";
  
  let messages;
  if (isAppError && err.messages) {
    messages = err.messages;
  } else {
    messages = {
      en: isAppError ? err.message : "An unexpected operational failure occurred.",
      ar: "حدث خطأ غير متوقع في النظام."
    };
  }

  res.status(statusCode).json({
    success: false,
    code: errorCode,
    messages: messages,
    ...(err.details && { details: err.details })
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
