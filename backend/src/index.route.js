// src/index.route.js
const express = require('express');
const { logger } = require('./sheared/utils/logger');
const { routes: authRoutes } = require('./modules/auth');
const { routes: medicationRoutes } = require('./modules/medications');
const { routes: doseRoutes } = require('./modules/doses');
const { routes: notificationRoutes } = require('./modules/notifications');
const { routes: pharmacyRoutes } = require('./modules/pharmacy');
const { routes: doctorRoutes } = require('./modules/doctor');
const { routes: relationshipRoutes } = require('./modules/relationships');
const { routes: adminRoutes } = require('./modules/admin');
const { routes: exportRoutes } = require('./modules/export');
const { routes: aiRoutes } = require('./modules/ai');

const router = express.Router();

// ===== Health Check =====
router.get('/health', (req, res) => {
  logger.debug('System check triggered');
  res.status(200).json({
    success: true,
    data: {
      status: 'UP',
      service: 'wafa-api',
      version: '2.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

// ===== Module Routes =====
router.use('/auth', authRoutes);
router.use('/medications', medicationRoutes);
router.use('/doses', doseRoutes);
router.use('/notifications', notificationRoutes);
router.use('/pharmacy', pharmacyRoutes);
router.use('/doctor', doctorRoutes);
router.use('/relationships', relationshipRoutes);
router.use('/admin', adminRoutes);
router.use('/export', exportRoutes);
router.use('/ai', aiRoutes);

// TODO: Register when implemented
// router.use('/profiles', profileRoutes);
// router.use('/conditions', conditionRoutes);
// router.use('/education', educationRoutes);
// router.use('/uploads', uploadRoutes);

module.exports = router;
