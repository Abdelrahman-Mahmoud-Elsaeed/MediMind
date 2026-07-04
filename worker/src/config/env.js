// worker/src/config/env.js
const dotenv = require('dotenv');
dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  REDIS_URL: process.env.REDIS_URL || 'redis://redis:6379',
  
  BACKEND_API_URL: process.env.BACKEND_API_URL || 'http://api:8080/api/v1'
};

module.exports = Object.freeze(env);