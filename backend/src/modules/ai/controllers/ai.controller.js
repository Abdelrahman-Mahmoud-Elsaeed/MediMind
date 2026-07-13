const drugInteractionService = require('../services/drugInteraction.service');
const adherencePredictionService = require('../services/adherencePrediction.service');
const smartRemindersService = require('../services/smartReminders.service');
const { logger } = require('../../../sheared/utils/logger');

class AIController {

  /**
   * GET /ai/interactions
   * Check all drug interactions for current patient
   */
  async getInteractions(req, res, next) {
    try {
      const result = await drugInteractionService.checkPatientMedications(req.patientId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      logger.error('AI interactions error:', error);
      next(error);
    }
  }

  /**
   * POST /ai/interactions/check
   * Check interactions for a new medication before adding
   * @body { drugName }
   */
  async checkNewMedication(req, res, next) {
    try {
      const { drugName } = req.body;
      if (!drugName) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'drugName is required' }
        });
      }

      const result = await drugInteractionService.checkNewMedication(req.patientId, drugName);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      logger.error('AI check new medication error:', error);
      next(error);
    }
  }

  /**
   * GET /ai/interactions/:drugName
   * Get all known interactions for a single drug
   */
  async getDrugInfo(req, res, next) {
    try {
      const interactions = drugInteractionService.checkSingleDrug(req.params.drugName);
      res.status(200).json({
        success: true,
        data: {
          drugName: req.params.drugName,
          totalInteractions: interactions.length,
          interactions
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /ai/predictions
   * Get adherence risk prediction for current patient
   * @query days (default 7)
   */
  async getAdherencePrediction(req, res, next) {
    try {
      const days = parseInt(req.query.days) || 7;
      const result = await adherencePredictionService.predictAdherenceRisk(req.patientId, days);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      logger.error('AI adherence prediction error:', error);
      next(error);
    }
  }

  /**
   * GET /ai/insights
   * Combined AI insights (interactions + predictions)
   */
  async getInsights(req, res, next) {
    try {
      const [interactions, predictions, smartReminders] = await Promise.all([
        drugInteractionService.checkPatientMedications(req.patientId),
        adherencePredictionService.predictAdherenceRisk(req.patientId, 7),
        smartRemindersService.analyzePatientBehavior(req.patientId)
      ]);

      res.status(200).json({
        success: true,
        data: {
          interactions,
          predictions,
          smartReminders,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('AI insights error:', error);
      next(error);
    }
  }

  /**
   * GET /ai/smart-reminders
   * Get smart reminder analysis for current patient
   */
  async getSmartReminders(req, res, next) {
    try {
      const result = await smartRemindersService.analyzePatientBehavior(req.patientId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      logger.error('Smart reminders error:', error);
      next(error);
    }
  }

  /**
   * GET /ai/smart-reminders/settings
   * Get smart reminder settings (for worker/cron)
   */
  async getSmartReminderSettings(req, res, next) {
    try {
      const settings = await smartRemindersService.getSmartReminderSettings(req.patientId);
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AIController();
