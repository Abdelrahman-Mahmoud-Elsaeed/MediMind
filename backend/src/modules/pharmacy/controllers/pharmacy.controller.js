const pharmacyService = require('../services/pharmacy.service');
const { logger } = require('../../../shared/utils/logger');

class PharmacyController {
  async getPatients(req, res, next) {
    try { const list = await pharmacyService.getPatients(req.accountId); res.status(200).json({ success: true, data: list }); }
    catch (e) { logger.error(e, 'pharmacy.getPatients'); next(e); }
  }
  async getRefillSoon(req, res, next) {
    try { const list = await pharmacyService.getRefillSoon(req.accountId); res.status(200).json({ success: true, data: list }); }
    catch (e) { logger.error(e, 'pharmacy.getRefillSoon'); next(e); }
  }
  async getAnalytics(req, res, next) {
    try { const data = await pharmacyService.getAnalytics(req.accountId); res.status(200).json({ success: true, data }); }
    catch (e) { logger.error(e, 'pharmacy.getAnalytics'); next(e); }
  }
  async sendRefillReminder(req, res, next) {
    try { const result = await pharmacyService.sendRefillReminder(req.accountId, req.params.patientId); res.status(200).json({ success: true, data: result }); }
    catch (e) { logger.error(e, 'pharmacy.sendRefillReminder'); next(e); }
  }
}

module.exports = new PharmacyController();
