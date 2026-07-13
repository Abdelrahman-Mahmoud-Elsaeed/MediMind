// worker/src/shared/logger.js
const { NODE_ENV } = require('../config/env');

const isDevelopment = NODE_ENV === 'development';

const appLogger = {
  info: (msg, meta = '') => console.log(`[WORKER-INFO] ${msg}`, meta),
  warn: (msg, meta = '') => console.warn(`\x1b[33m[WORKER-WARN]\x1b[0m ${msg}`, meta),
  error: (err, msg = '') => console.error(`\x1b[31m[WORKER-ERROR]\x1b[0m ${msg}`, err),
  debug: (msg, meta = '') => {
    if (isDevelopment) console.log(`\x1b[36m[WORKER-DEBUG]\x1b[0m ${msg}`, meta);
  }
};

module.exports = { logger: appLogger };