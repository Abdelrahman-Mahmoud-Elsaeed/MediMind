const doseService = require('../services/dose.service');
const { logger } = require('../../../sheared/utils/logger');

class DoseController {

  /**
   * GET /doses?patientId=...&date=...
   * Get daily schedule
   */
  async getDailySchedule(req, res, next) {
    try {
      const { patientId, date } = req.query;
      if (!patientId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'patientId is required' }
        });
      }
      const targetDate = date ? new Date(date) : new Date();
      const events = await doseService.getDailySchedule(patientId, targetDate);
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /doses/adherence?patientId=...&days=30
   * Get adherence stats
   */
  async getAdherence(req, res, next) {
    try {
      const { patientId, days } = req.query;
      if (!patientId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'patientId is required' }
        });
      }
      const stats = await doseService.getAdherenceStats(patientId, parseInt(days) || 30);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /doses/:id/confirm
   * Confirm a dose as taken
   */
  async confirm(req, res, next) {
    try {
      const result = await doseService.confirm(
        req.params.id,
        req.accountId,
        req.body.takenVia
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      logger.error('Confirm dose error:', error);
      next(error);
    }
  }

  /**
   * POST /doses/:id/skip
   * Skip a dose
   */
  async skip(req, res, next) {
    try {
      const result = await doseService.skip(req.params.id, req.accountId, req.body.reason);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      logger.error('Skip dose error:', error);
      next(error);
    }
  }
}

module.exports = new DoseController();
