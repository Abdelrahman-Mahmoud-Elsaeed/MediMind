// src/utils/db.js
const mongoose = require('mongoose');
const {logger} = require('../shared/utils/logger');
const { MONGO_URI } = require('../config/env');

const connectDB = async () => {
  try {
    const mongoUri = MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing from environment variables');
    }
    await mongoose.connect(mongoUri);
    logger.info('Successfully established secure connection to MongoDB Database.');
  } catch (error) {
    logger.error(error, 'Critical database connection failure');
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('Database connection lost! Attempting automated reconnect pipeline...');
});

mongoose.connection.on('error', (err) => {
  logger.error(err, 'Operational database socket runtime event error error');
});

module.exports = connectDB;