// worker/src/config/env.js
const dotenv = require('dotenv');
dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  WORKER_INTERNAL_SECRET: process.env.WORKER_SECRET || process.env.WORKER_INTERNAL_SECRET || 'secret_token_123',
  BACKEND_API_URL: process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080/api/v1',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medimind',

  // AWS Provisioned Resources
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  SNS_TOPIC_ARN: process.env.SNS_TOPIC_ARN || process.env.AWS_SNS_TOPIC_ARN,
  SQS_QUEUE_ID: process.env.SQS_QUEUE_ID || process.env.AWS_SQS_QUEUE_ID,
  SQS_QUEUE_ARN: process.env.SQS_QUEUE_ARN || process.env.AWS_SQS_QUEUE_ARN,
};

module.exports = Object.freeze(env);     