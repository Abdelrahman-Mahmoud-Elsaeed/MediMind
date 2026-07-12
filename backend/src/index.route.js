// src/index.route.js
const express = require('express');
const { logger } = require('./shared/utils/logger');
const { routes: authRoutes } = require('./modules/auth');
const { routes: profilesRoutes } = require('./modules/profiles');
const { routes: conditionsRoutes } = require('./modules/conditions');
const { routes: medicationsRoutes } = require('./modules/medications');
const { routes: relationshipsRoutes } = require('./modules/relationships');
const { routes: dosesRoutes } = require('./modules/doses');

const router = express.Router();

router.get('/health', (req, res) => {
  logger.debug('System check triggered');
  res.status(200).json({ 
    success: true, 
    data: { status: 'UP', timestamp: new Date().toISOString() } 
  });
});

router.use('/auth', authRoutes);
router.use('/profiles', profilesRoutes);
router.use('/conditions', conditionsRoutes);
router.use('/medications', medicationsRoutes);
router.use('/relationships', relationshipsRoutes);
router.use('/doses', dosesRoutes);

module.exports = router;