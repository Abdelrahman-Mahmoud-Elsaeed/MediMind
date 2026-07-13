// src/config/env.js
const dotenv = require('dotenv');

// Load .env variables into process.env immediately
dotenv.config();

const env = {
  // ===== APP =====
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 8080,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // ===== DATABASE (MONGODB) =====
  MONGO_ROOT_USER: process.env.MONGO_ROOT_USER,
  MONGO_ROOT_PASSWORD: process.env.MONGO_ROOT_PASSWORD,
  MONGO_URI: process.env.MONGO_URI,

  // ===== ASYNC QUEUES (REDIS & BULLMQ) =====
  REDIS_URL: process.env.REDIS_URL || 'redis://redis:6379',

  // ===== AUTH SECRETS =====
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'dev-cookie-secret-change-in-production',
  OTP_SALT: process.env.OTP_SALT || 'wafa-dev-otp-salt',

  // ===== AWS S3 (Image Uploads) =====
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',

  // ===== AWS SNS (SMS for OTP) =====
  AWS_SNS_REGION: process.env.AWS_SNS_REGION || 'us-east-1',
  AWS_SNS_SENDER_ID: process.env.AWS_SNS_SENDER_ID || 'WAFA',

  // ===== WHATSAPP BUSINESS API =====
  WHATSAPP_API_VERSION: process.env.WHATSAPP_API_VERSION || 'v18.0',
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_FROM_NUMBER: process.env.WHATSAPP_FROM_NUMBER,

  // ===== PWA WEB PUSH (VAPID) =====
  VAPID_SUBJECT: process.env.VAPID_SUBJECT,
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,

  // ===== RATE LIMITS =====
  RATE_LIMIT_GLOBAL_MAX: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX, 10) || 100,
  RATE_LIMIT_GLOBAL_WINDOW_MS: parseInt(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS, 10) || 60000,
  RATE_LIMIT_AUTH_MAX: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 5,
  RATE_LIMIT_AUTH_WINDOW_MS: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS, 10) || 900000,
  RATE_LIMIT_MEDIA_MAX: parseInt(process.env.RATE_LIMIT_MEDIA_MAX, 10) || 20,
  RATE_LIMIT_MEDIA_WINDOW_MS: parseInt(process.env.RATE_LIMIT_MEDIA_WINDOW_MS, 10) || 3600000,

  // ===== SENTRY (Error Tracking) =====
  SENTRY_DSN: process.env.SENTRY_DSN,
  SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  SENTRY_RELEASE: process.env.SENTRY_RELEASE || 'wafa@3.0.0',
  SENTRY_TRACES_SAMPLE_RATE: process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1',
  SENTRY_PROFILES_SAMPLE_RATE: process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1',
};

module.exports = Object.freeze(env);
