// src/index.route.js
const express = require('express');
const { logger } = require('./sheared/utils/logger');

const router = express.Router();

router.get('/health', (req, res) => {
  logger.debug('System check triggered');
  res.status(200).json({ 
    success: true, 
    data: { status: 'UP', timestamp: new Date().toISOString() } 
  });
});

// Future module routes will plug in right here:
// router.use('/auth', authRoutes);
// router.use('/medications', medicationRoutes);

module.exports = router;