const dosesService = require('../services/doses.service');
const ServiceResponse = require('../../../shared/utils/ServiceResponse');
const { logger } = require('../../../shared/utils/logger');

class DosesController {
  async getSchedule(req, res, next) {
    try {
      const patientId = req.query.patientId || null;
      const { date } = req.query;

      const schedule = await dosesService.getDailySchedule(
        req.accountId,
        req.role,
        patientId,
        date
      );

      return new ServiceResponse({
        en: 'Dose schedule retrieved successfully.',
        ar: 'تم استرجاع جدول الجرعات بنجاح.',
        data: schedule
      }).send(res);
    } catch (error) {
      logger.error('Error fetching daily dose schedule:', error);
      next(error);
    }
  }

  async confirm(req, res, next) {
    try {
      const { doseEventId } = req.params;
      const result = await dosesService.confirmDose(
        req.accountId,
        req.role,
        doseEventId
      );

      return new ServiceResponse({
        en: 'Dose confirmed as taken.',
        ar: 'تم تأكيد تناول الجرعة بنجاح.',
        data: result
      }).send(res);
    } catch (error) {
      logger.error('Error confirming dose taken:', error);
      next(error);
    }
  }

  async skip(req, res, next) {
    try {
      const { doseEventId } = req.params;
      const result = await dosesService.skipDose(
        req.accountId,
        req.role,
        doseEventId
      );

      return new ServiceResponse({
        en: 'Dose skipped successfully.',
        ar: 'تم تخطي الجرعة بنجاح.',
        data: result
      }).send(res);
    } catch (error) {
      logger.error('Error skipping dose:', error);
      next(error);
    }
  }

  async snooze(req, res, next) {
    try {
      const { doseEventId } = req.params;
      const minutes = req.body.minutes ? Number(req.body.minutes) : 15;
      const result = await dosesService.snoozeDose(
        req.accountId,
        req.role,
        doseEventId,
        minutes
      );

      return new ServiceResponse({
        en: 'Dose snoozed successfully.',
        ar: 'تم تأجيل الجرعة بنجاح.',
        data: result
      }).send(res);
    } catch (error) {
      logger.error('Error snoozing dose:', error);
      next(error);
    }
  }
}

module.exports = new DosesController();
