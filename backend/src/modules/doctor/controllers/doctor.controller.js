const doctorService = require('../services/doctor.service');
const doctorReportsService = require('../services/doctorReports.service');
const { logger } = require('../../../sheared/utils/logger');

class DoctorController {

  async getDashboard(req, res, next) {
    try {
      const data = await doctorService.getDashboard(req.accountId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      logger.error('Doctor dashboard error:', error);
      next(error);
    }
  }

  async getPatients(req, res, next) {
    try {
      const { search, sortBy } = req.query;
      const patients = await doctorService.getPatients(req.accountId, {
        search: search || '',
        sortBy: sortBy || 'adherence'
      });
      res.status(200).json({ success: true, data: patients });
    } catch (error) {
      next(error);
    }
  }

  async getWeeklyReportPreview(req, res, next) {
    try {
      const preview = await doctorService.getWeeklyReportPreview(req.accountId);
      res.status(200).json({ success: true, data: preview });
    } catch (error) {
      logger.error('Weekly report preview error:', error);
      next(error);
    }
  }

  async updateReportSettings(req, res, next) {
    try {
      const settings = await doctorService.updateReportSettings(req.accountId, req.body);
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/doctor/reports?period=30
   * Get full analytics report for all doctor's patients
   */
  async getFullReport(req, res, next) {
    try {
      const period = parseInt(req.query.period) || 30;
      const report = await doctorReportsService.getFullReport(req.accountId, { period });
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      logger.error('Doctor full report error:', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/doctor/reports/patients/:patientId?period=30
   * Get detailed report for a specific patient
   */
  async getPatientDetail(req, res, next) {
    try {
      const period = parseInt(req.query.period) || 30;
      const detail = await doctorReportsService.getPatientDetail(
        req.accountId,
        req.params.patientId,
        { period }
      );
      res.status(200).json({ success: true, data: detail });
    } catch (error) {
      logger.error('Patient detail report error:', error);
      next(error);
    }
  }
}

module.exports = new DoctorController();
