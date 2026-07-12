const dosesService = require('../services/doses.service');
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

      res.status(200).json({
        success: true,
        data: schedule
      });
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

      res.status(200).json({
        success: true,
        data: result
      });
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

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error skipping dose:', error);
      next(error);
    }
  }
}

module.exports = new DosesController();
