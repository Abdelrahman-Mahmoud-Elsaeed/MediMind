// src/sheared/middleware/error.middleware.js
const { logger } = require('../utils/logger');
const sentryService = require('../services/sentry.service');

/**
 * Global application error handling interceptor
 * Captures errors in Sentry and returns JSON response
 */
const errorMiddleware = (err, req, res, next) => {
  logger.error(err, `Exception intercepted on [${req.method}] ${req.url}`);

  // Capture in Sentry (with request context)
  sentryService.captureException(err, {
    tags: {
      route: req.url,
      method: req.method,
      statusCode: err.statusCode || 500
    },
    extra: {
      body: req.body ? JSON.stringify(req.body).substring(0, 500) : null,
      query: req.query,
      params: req.params
    },
    user: req.accountId ? {
      id: req.accountId,
      role: req.role
    } : null
  });

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected operational failure occurred.';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message
    }
  });
};

const notFoundMiddleware = (req, res, next) => {
  const error = new Error(`Route [${req.method}] ${req.url} not found`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  next(error);
};

module.exports = {
  errorMiddleware,
  notFoundMiddleware
};
