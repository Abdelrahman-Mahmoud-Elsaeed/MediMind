/**
 * Sentry Service — وفاء (Wafa)
 *
 * Error tracking and performance monitoring via Sentry.
 *
 * Features:
 *  - Automatic error capture (Express middleware)
 *  - Manual error reporting
 *  - Performance monitoring (transaction tracing)
 *  - User context (account ID, role)
 *  - Request context (URL, method, headers)
 *  - Release tracking
 *
 * Setup:
 *  1. Create account at https://sentry.io
 *  2. Create a Node.js project
 *  3. Set SENTRY_DSN environment variable
 *  4. (Optional) Set SENTRY_ENVIRONMENT, SENTRY_RELEASE
 */

let Sentry = null;
let initialized = false;

/**
 * Initialize Sentry (only if SENTRY_DSN is set)
 */
function initSentry() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.log('⚠️  Sentry: SENTRY_DSN not set — error tracking disabled');
    return false;
  }

  try {
    Sentry = require('@sentry/node');

    Sentry.init({
      dsn,
      environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
      release: process.env.SENTRY_RELEASE || 'wafa@3.0.0',
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1, // 10% of transactions
      profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE) || 0.1,
      maxBreadcrumbs: 50,
      sendDefaultPii: false, // Don't send PII (phone, email)
      integrations: [
        // Enable HTTP tracing
        Sentry.httpIntegration(),
        // Enable Express middleware
        Sentry.expressIntegration(),
        // Enable MongoDB tracing
        Sentry.mongooseIntegration()
      ],
      beforeSend(event) {
        // Sanitize sensitive data before sending
        if (event.request) {
          // Remove auth headers
          if (event.request.headers) {
            delete event.request.headers.authorization;
            delete event.request.headers.cookie;
          }
          // Remove sensitive body fields
          if (event.request.data && typeof event.request.data === 'object') {
            delete event.request.data.password;
            delete event.request.data.passwordHash;
            delete event.request.data.otp;
            delete event.request.data.token;
          }
        }
        return event;
      }
    });

    initialized = true;
    console.log('✅ Sentry initialized — error tracking active');
    return true;
  } catch (err) {
    console.warn('⚠️  Sentry: Failed to initialize (package not installed):', err.message);
    console.warn('   Install with: npm install @sentry/node');
    return false;
  }
}

/**
 * Get Sentry instance (null if not initialized)
 */
function getSentry() {
  return initialized ? Sentry : null;
}

/**
 * Check if Sentry is initialized
 */
function isInitialized() {
  return initialized;
}

/**
 * Manually capture an exception
 * @param {Error} error - Error object
 * @param {Object} context - Additional context { tags, extra, user }
 */
function captureException(error, context = {}) {
  if (!initialized || !Sentry) return;

  Sentry.withScope((scope) => {
    // Add tags
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    // Add extra context
    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    // Set user
    if (context.user) {
      // Don't send PII — use account ID only
      scope.setUser({
        id: context.user.id || context.user.accountId,
        role: context.user.role
      });
    }

    Sentry.captureException(error);
  });
}

/**
 * Capture a message (info, warning, error)
 * @param {String} message - Message to capture
 * @param {String} level - 'info', 'warning', 'error'
 * @param {Object} context - Additional context
 */
function captureMessage(message, level = 'info', context = {}) {
  if (!initialized || !Sentry) return;

  Sentry.withScope((scope) => {
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureMessage(message, level);
  });
}

/**
 * Set user context for current request
 * @param {Object} user - { id, role }
 */
function setUser(user) {
  if (!initialized || !Sentry) return;
  Sentry.setUser({
    id: user.id || user.accountId,
    role: user.role
  });
}

/**
 * Set tag for current scope
 */
function setTag(key, value) {
  if (!initialized || !Sentry) return;
  Sentry.setTag(key, value);
}

/**
 * Add breadcrumb for debugging
 * @param {String} message - Breadcrumb message
 * @param {String} category - Category (e.g., 'http', 'db', 'ui')
 * @param {String} level - 'info', 'warning', 'error'
 * @param {Object} data - Additional data
 */
function addBreadcrumb(message, category = 'default', level = 'info', data = {}) {
  if (!initialized || !Sentry) return;
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000
  });
}

/**
 * Express error handler middleware
 * Must be registered AFTER all routes and AFTER the regular error handler
 */
function errorHandler() {
  if (!initialized || !Sentry) {
    // Return a no-op middleware if Sentry is not initialized
    return (err, req, res, next) => next(err);
  }
  return Sentry.Handlers.errorHandler();
}

/**
 * Express request handler middleware
 * Must be registered BEFORE all routes
 */
function requestHandler() {
  if (!initialized || !Sentry) {
    return (req, res, next) => next();
  }
  return Sentry.Handlers.requestHandler({
    serverName: true,
    user: false, // We set user manually to avoid PII
    request: true,
    ip: false, // Don't send IP
    transaction: 'path'
  });
}

module.exports = {
  initSentry,
  getSentry,
  isInitialized,
  captureException,
  captureMessage,
  setUser,
  setTag,
  addBreadcrumb,
  errorHandler,
  requestHandler
};
