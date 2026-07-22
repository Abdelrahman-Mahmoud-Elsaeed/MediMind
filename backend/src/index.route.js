const express = require('express');
const { logger } = require('./shared/utils/logger');
const { routes: authRoutes } = require('./modules/auth');
const { routes: profilesRoutes } = require('./modules/profiles');
const { routes: conditionsRoutes } = require('./modules/conditions');
const { routes: medicationsRoutes } = require('./modules/medications');
const { routes: relationshipsRoutes } = require('./modules/relationships');
const { routes: dosesRoutes } = require('./modules/doses');
const { routes: alarmsRoutes } = require('./modules/alarms');
const { routes: devicesRoutes } = require('./modules/devices');
const { routes: consentRoutes } = require('./modules/consent');
const { routes: pharmacyRoutes } = require('./modules/pharmacy');
const { routes: doctorRoutes } = require('./modules/doctor');

const router = express.Router();

router.get('/health', (req, res) => {
  logger.debug('System check triggered');
  res.status(200).json({ success: true, data: { status: 'UP', timestamp: new Date().toISOString() } });
});

router.use('/auth', authRoutes);
router.use('/profiles', profilesRoutes);
router.use('/conditions', conditionsRoutes);
router.use('/medications', medicationsRoutes);
router.use('/relationships', relationshipsRoutes);
router.use('/doses', dosesRoutes);
router.use('/alarms', alarmsRoutes);
router.use('/devices', devicesRoutes);
router.use('/consent', consentRoutes);
router.use('/pharmacy', pharmacyRoutes);
router.use('/doctor', doctorRoutes);

module.exports = router;
