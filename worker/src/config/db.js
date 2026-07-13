// worker/src/config/db.js
const mongoose = require('../../../backend/node_modules/mongoose');
const { logger } = require('../shared/logger');
const { MONGO_URI } = require('./env');

const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is missing from environment variables');
    }
    await mongoose.connect(MONGO_URI);
    logger.info('✅ Worker connected to MongoDB successfully.');
  } catch (error) {
    logger.error('❌ Worker MongoDB connection failure:', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ Worker DB connection lost! Attempting reconnect...');
});

mongoose.connection.on('error', (err) => {
  logger.error('Worker DB runtime error:', err.message);
});

module.exports = connectDB;
