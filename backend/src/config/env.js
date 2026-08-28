// src/config/env.js
const dotenv = require('dotenv');

// Load .env variables into process.env immediately
dotenv.config();

const env = {
  // NODE ENVIRONMENT SETUP
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 8080,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  FRONTEND_URL:process.env.FRONTEND_URL,
  // PERSISTENT DATABASE (MONGODB / DOCUMENTDB)
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medimind',

  // ASYNC QUEUES & CACHING LAYER (ELASTICACHE REDIS & BULLMQ)
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',

  // SPLIT-TOKEN AUTHENTICATION SECRETS
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  WORKER_INTERNAL_SECRET: process.env.WORKER_SECRET || process.env.WORKER_INTERNAL_SECRET || 'secret_token_123',

  // DATA PROTECTION: PHI AT-REST FIELD ENCRYPTION
  ENCRYPTION_KEY_AES256: process.env.ENCRYPTION_KEY_AES256,

  // OBJECT STORAGE: AWS S3 SECURE IMAGE UPLOADS
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME,
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',

  // ESCALATION & MESSAGING PIPELINE: AWS SNS & SQS PIPELINES
  SNS_TOPIC_ARN: process.env.SNS_TOPIC_ARN || process.env.AWS_SNS_TOPIC_ARN,
  SQS_QUEUE_ID: process.env.SQS_QUEUE_ID || process.env.AWS_SQS_QUEUE_ID,
  SQS_QUEUE_ARN: process.env.SQS_QUEUE_ARN || process.env.AWS_SQS_QUEUE_ARN,
  AWS_SNS_REGION: process.env.AWS_REGION || process.env.AWS_SNS_REGION || 'us-east-1',
  AWS_SNS_SENDER_ID: process.env.AWS_SNS_SENDER_ID || 'MEDTRACK',

  // RESEND TRANSACTIONAL EMAIL (OTP, password reset, caregiver invites)
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM_ADDRESS:
    process.env.EMAIL_FROM_ADDRESS || 'MediMind <no-reply@medimind.app>',

  // PWA FRONTEND MECHANICS: WEB-PUSH NOTIFICATIONS
  VAPID_SUBJECT: process.env.VAPID_SUBJECT,
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,

  // STRIPE PAYMENT GATEWAY
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_51MockMediMindStripeKeySecret1234567890',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock_medimind_webhook_secret',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51MockMediMindStripeKeyPub1234567890',

  // GATEKEEPER DEFENSES: SECURITY RATE LIMIT CONSTRAINTS
  RATE_LIMIT_GLOBAL_MAX: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX, 10) || 100,
  RATE_LIMIT_GLOBAL_WINDOW_MS: parseInt(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS, 10) || 60000,

  RATE_LIMIT_AUTH_MAX: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 5,
  RATE_LIMIT_AUTH_WINDOW_MS: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS, 10) || 900000,

  RATE_LIMIT_MEDIA_MAX: parseInt(process.env.RATE_LIMIT_MEDIA_MAX, 10) || 20,
  RATE_LIMIT_MEDIA_WINDOW_MS: parseInt(process.env.RATE_LIMIT_MEDIA_WINDOW_MS, 10) || 3600000,

  // AI OCR SERVICES (QWEN / GEMINI)
  OCR_PROVIDER: process.env.OCR_PROVIDER || 'auto',
  QWEN_API_KEY: process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY,
  QWEN_API_BASE_URL: process.env.QWEN_API_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
  QWEN_MODEL: process.env.QWEN_MODEL || 'qwen-vl-max',

  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
};


module.exports = Object.freeze(env);