const exportService = require('../services/export.service');
const Patient = require('../../auth/models/Patient.model');
const { logger } = require('../../../sheared/utils/logger');

class ExportController {

  /**
   * GET /export/patient/:patientId/pdf
   * Get patient report as HTML (for browser print to PDF)
   * @query period (7|30|90, default 30)
   */
  async exportPatientPDF(req, res, next) {
    try {
      const period = parseInt(req.query.period) || 30;
      const html = await exportService.generatePatientReportHTML(req.params.patientId, period);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `inline; filename="wafa-report-${req.params.patientId}.html"`);
      res.status(200).send(html);
    } catch (error) {
      logger.error('Export patient PDF error:', error);
      next(error);
    }
  }

  /**
   * GET /export/patient/:patientId/csv
   * Get patient report as CSV (Excel-compatible)
   * @query period (7|30|90, default 30)
   */
  async exportPatientCSV(req, res, next) {
    try {
      const period = parseInt(req.query.period) || 30;

      // Verify access
      const patient = await Patient.findById(req.params.patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Patient not found' }
        });
      }

      const csv = await exportService.generatePatientReportCSV(req.params.patientId, period);

      const filename = `wafa-report-${patient.firstName}-${patient.lastName}-${period}days.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.status(200).send(csv);
    } catch (error) {
      logger.error('Export patient CSV error:', error);
      next(error);
    }
  }

  /**
   * GET /export/doctor/csv
   * Get doctor's panel report as CSV
   * @query period (7|30|90, default 30)
   */
  async exportDoctorCSV(req, res, next) {
    try {
      const period = parseInt(req.query.period) || 30;
      const csv = await exportService.generateDoctorReportCSV(req.accountId, period);

      const filename = `wafa-doctor-report-${period}days.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.status(200).send(csv);
    } catch (error) {
      logger.error('Export doctor CSV error:', error);
      next(error);
    }
  }
}

module.exports = new ExportController();
