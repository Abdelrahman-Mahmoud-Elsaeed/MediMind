const doctorService = require('../services/doctor.service');
const { logger } = require('../../../shared/utils/logger');

class DoctorController {
  async getPatients(req, res, next) {
    try { const list = await doctorService.getPatients(req.accountId); res.status(200).json({ success: true, data: list }); }
    catch (e) { logger.error(e, 'doctor.getPatients'); next(e); }
  }
  async getCompliance(req, res, next) {
    try { const data = await doctorService.getPatientCompliance(req.accountId, req.params.patientId); res.status(200).json({ success: true, data }); }
    catch (e) { logger.error(e, 'doctor.getCompliance'); next(e); }
  }
  async getWeeklyReport(req, res, next) {
    try { const data = await doctorService.getWeeklyReport(req.accountId); res.status(200).json({ success: true, data }); }
    catch (e) { logger.error(e, 'doctor.getWeeklyReport'); next(e); }
  }
}

module.exports = new DoctorController();
