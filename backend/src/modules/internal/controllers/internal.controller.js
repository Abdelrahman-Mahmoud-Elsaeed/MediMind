// backend/src/modules/internal/controllers/internal.controller.js
const { logger } = require('../../../shared/utils/logger');
const dosesService = require('../../doses/services/doses.service');

class InternalController {
  generateDailyDoses = async (req, res, next) => {
    try {
      logger.info('Internal API: generateDailyDoses triggered');
      await dosesService.generateDailyDoses();
      return res.status(200).json({ success: true, message: 'Daily doses generated' });
    } catch (error) {
      next(error);
    }
  };

  evaluateMissedDoses = async (req, res, next) => {
    try {
      logger.info('Internal API: evaluateMissedDoses triggered');
      const count = await dosesService.evaluateMissedDoses();
      return res.status(200).json({ success: true, message: `Missed doses evaluated. ${count} updated.` });
    } catch (error) {
      next(error);
    }
  };

  evaluateSnoozeLimits = async (req, res, next) => {
    try {
      logger.info('Internal API: evaluateSnoozeLimits triggered');
      const count = await dosesService.evaluateSnoozeLimits();
      return res.status(200).json({ success: true, message: `Snooze limits evaluated. ${count} updated.` });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new InternalController();
