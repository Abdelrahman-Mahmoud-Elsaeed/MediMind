// worker/src/config/env.js
const dotenv = require('dotenv');
dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  PORT: parseInt(process.env.PORT, 10) || 3001,

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://redis:6379',

  // MongoDB (worker connects directly to DB for cron jobs)
  MONGO_URI: process.env.MONGO_URI || 'mongodb://wafa_admin:change_me_in_production@mongodb:27017/wafa?authSource=admin',

  // Backend API (for internal HTTP calls if needed)
  BACKEND_API_URL: process.env.BACKEND_API_URL || 'http://api:8080/api/v1',

  // WhatsApp (for weekly doctor reports)
  WHATSAPP_API_VERSION: process.env.WHATSAPP_API_VERSION || 'v18.0',
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_FROM_NUMBER: process.env.WHATSAPP_FROM_NUMBER,

  // VAPID (for push notifications)
  VAPID_SUBJECT: process.env.VAPID_SUBJECT || 'mailto:admin@wafa.app',
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,

  // Cron intervals (in cron format)
  CRON_ESCALATION: process.env.CRON_ESCALATION || '*/1 * * * *',          // Every minute
  CRON_GENERATE_DOSES: process.env.CRON_GENERATE_DOSES || '0 * * * *',     // Every hour
  CRON_WEEKLY_REPORTS: process.env.CRON_WEEKLY_REPORTS || '0 18 * * 5',   // Friday 6 PM
  CRON_REFILL_CHECK: process.env.CRON_REFILL_CHECK || '0 9 * * *',         // Daily 9 AM
  CRON_EXPIRATION_CHECK: process.env.CRON_EXPIRATION_CHECK || '0 10 * * 1' // Monday 10 AM
};

module.exports = Object.freeze(env);
