const medicationService = require('../services/medication.service');
const { logger } = require('../../../sheared/utils/logger');

class MedicationController {

  /**
   * POST /medications
   * Create a new medication
   */
  async create(req, res, next) {
    try {
      const medication = await medicationService.create(
        req.accountId,
        req.role,
        req.body
      );
      res.status(201).json({ success: true, data: medication });
    } catch (error) {
      logger.error('Create medication error:', error);
      next(error);
    }
  }

  /**
   * GET /medications?patientId=...&isActive=true
   * Get all medications for a patient
   */
  async getAll(req, res, next) {
    try {
      const { patientId } = req.query;
      const isActive = req.query.isActive === 'true' ? true : undefined;

      // If no patientId provided, try to get from account
      let targetPatientId = patientId;
      if (!targetPatientId && req.role === 'PATIENT') {
        const Patient = require('../../auth/models/Patient.model');
        const patient = await Patient.findOne({ accountId: req.accountId });
        if (patient) targetPatientId = patient._id;
      }

      if (!targetPatientId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'patientId is required' }
        });
      }

      const medications = await medicationService.getByPatient(targetPatientId, { isActive });
      res.status(200).json({ success: true, data: medications });
    } catch (error) {
      logger.error('Get medications error:', error);
      next(error);
    }
  }

  /**
   * GET /medications/:id
   */
  async getById(req, res, next) {
    try {
      const medication = await medicationService.getById(req.params.id, req.accountId);
      res.status(200).json({ success: true, data: medication });
    } catch (error) {
      logger.error('Get medication error:', error);
      next(error);
    }
  }

  /**
   * PUT /medications/:id
   */
  async update(req, res, next) {
    try {
      const medication = await medicationService.update(req.params.id, req.accountId, req.body);
      res.status(200).json({ success: true, data: medication });
    } catch (error) {
      logger.error('Update medication error:', error);
      next(error);
    }
  }

  /**
   * DELETE /medications/:id
   * Soft-delete (deactivate)
   */
  async deactivate(req, res, next) {
    try {
      await medicationService.deactivate(req.params.id, req.accountId);
      res.status(204).json({ success: true, data: null });
    } catch (error) {
      logger.error('Deactivate medication error:', error);
      next(error);
    }
  }

  /**
   * POST /medications/:id/refill
   * Refill medication inventory
   */
  async refill(req, res, next) {
    try {
      const medication = await medicationService.refill(
        req.params.id,
        req.accountId,
        req.body.newQuantity
      );
      res.status(200).json({ success: true, data: medication });
    } catch (error) {
      logger.error('Refill medication error:', error);
      next(error);
    }
  }

  /**
   * GET /medications/refill-needed
   * Get medications that need refill soon
   */
  async getRefillNeeded(req, res, next) {
    try {
      const { patientId } = req.query;
      if (!patientId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'patientId is required' }
        });
      }
      const medications = await medicationService.getRefillNeeded(patientId);
      res.status(200).json({ success: true, data: medications });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /medications/expiring-soon
   */
  async getExpiringSoon(req, res, next) {
    try {
      const { patientId } = req.query;
      if (!patientId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'patientId is required' }
        });
      }
      const medications = await medicationService.getExpiringSoon(patientId);
      res.status(200).json({ success: true, data: medications });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /medications/scan
   * AI OCR scan of medication label
   */
  async scan(req, res, next) {
    try {
      const result = await medicationService.scanImage(req.body.imageBase64);

      // If confidence is low, return 422
      if (result.confidenceScore < 0.9) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'OCR_LOW_CONFIDENCE',
            message: 'Could not confidently identify the medication. Please enter details manually.',
            data: result
          }
        });
      }

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      logger.error('OCR scan error:', error);
      next(error);
    }
  }
}

module.exports = new MedicationController();
