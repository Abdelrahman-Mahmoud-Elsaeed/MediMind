// backend/src/modules/internal/controllers/internal.controller.js
const ServiceResponse = require('../../../shared/utils/ServiceResponse');
const { logger } = require('../../../shared/utils/logger');
const dosesService = require('../../doses/services/doses.service');

class InternalController {
  generateDailyDoses = async (req, res, next) => {
    try {
      logger.info('Internal API: generateDailyDoses triggered');
      await dosesService.generateDailyDoses();
      return new ServiceResponse({
        en: 'Daily doses generated successfully.',
        ar: 'تم توليد الجرعات اليومية بنجاح.',
        data: {}
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  evaluateMissedDoses = async (req, res, next) => {
    try {
      logger.info('Internal API: evaluateMissedDoses triggered');
      const count = await dosesService.evaluateMissedDoses();
      return new ServiceResponse({
        en: `Missed doses evaluated. ${count} updated.`,
        ar: `تم تقييم الجرعات الفائتة. تم تحديث ${count}.`,
        data: { count }
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  evaluateSnoozeLimits = async (req, res, next) => {
    try {
      logger.info('Internal API: evaluateSnoozeLimits triggered');
      const count = await dosesService.evaluateSnoozeLimits();
      return new ServiceResponse({
        en: `Snooze limits evaluated. ${count} updated.`,
        ar: `تم تقييم حدود التأجيل. تم تحديث ${count}.`,
        data: { count }
      }).send(res);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new InternalController();
