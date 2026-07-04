const morgan = require('morgan');
const { NODE_ENV } = require('../../config/env');

const isDevelopment = NODE_ENV === 'development';


const appLogger = {
  info: (msg, meta = '') => console.log(`[INFO] ${msg}`, meta),
  warn: (msg, meta = '') => console.warn(`\x1b[33m[WARN]\x1b[0m ${msg}`, meta),
  error: (err, msg = '') => console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`, err),
  debug: (msg, meta = '') => {
    if (isDevelopment) console.log(`\x1b[36m[DEBUG]\x1b[0m ${msg}`, meta);
  }
};


const productionNetworkFormat = (tokens, req, res) => {
  return JSON.stringify({
    timestamp: tokens.date(req, res, 'iso'),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: Number(tokens.status(req, res)),
    responseTimeMs: Number(tokens.res(req, res, 'response-time')),
    contentLength: parseInt(tokens.res(req, res, 'content-length'), 10) || 0,
    ip: req.ip || tokens['remote-addr'](req, res),
  });
};

const morganMiddleware = isDevelopment
  ? morgan('dev')
  : morgan(productionNetworkFormat);

module.exports = {
  logger: appLogger,
  morganLogger: morganMiddleware
};