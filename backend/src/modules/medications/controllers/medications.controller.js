const medicationsService = require('../services/medications.service');
const orderService = require('../services/order.service');
const { logger } = require('../../../shared/utils/logger');

class MedicationsController {
  async create(req, res, next) {
    try {
      const med = await medicationsService.createMedication(req.accountId, req.role, req.body);
      res.status(201).json({ success: true, data: { medicationId: med._id, name: med.name, status: 'CREATED' } });
    } catch (e) { logger.error(e, 'create'); next(e); }
  }

  async list(req, res, next) {
    try {
      const patientId = req.query.patientId || null;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
      const list = await medicationsService.listMedications(req.accountId, req.role, patientId, isActive);
      res.status(200).json({ success: true, data: list });
    } catch (e) { logger.error(e, 'list'); next(e); }
  }

  async refillSoon(req, res, next) {
    try {
      const patientId = req.query.patientId || null;
      const list = await medicationsService.getRefillSoon(req.accountId, req.role, patientId);
      res.status(200).json({ success: true, data: list });
    } catch (e) { logger.error(e, 'refillSoon'); next(e); }
  }

  async getOne(req, res, next) {
    try {
      const med = await medicationsService.getMedication(req.accountId, req.role, req.params.medicationId);
      res.status(200).json({ success: true, data: med });
    } catch (e) { logger.error(e, 'getOne'); next(e); }
  }

  async update(req, res, next) {
    try {
      const med = await medicationsService.updateMedication(req.accountId, req.role, req.params.medicationId, req.body);
      res.status(200).json({ success: true, data: med });
    } catch (e) { logger.error(e, 'update'); next(e); }
  }

  async delete(req, res, next) {
    try {
      await medicationsService.deleteMedication(req.accountId, req.role, req.params.medicationId);
      res.status(204).end();
    } catch (e) { logger.error(e, 'delete'); next(e); }
  }

  async scan(req, res, next) {
    try {
      const result = await medicationsService.scanMedication(req.body.imageBase64);
      res.status(200).json({ success: true, data: result });
    } catch (e) { logger.error(e, 'scan'); next(e); }
  }

  async order(req, res, next) {
    try {
      const { medicationId } = req.params;
      const { quantity } = req.body || { quantity: 1 };
      const result = await orderService.orderMedication(req.accountId, medicationId, quantity);
      res.status(201).json({ success: true, data: result });
    } catch (e) { logger.error(e, 'order'); next(e); }
  }
}

module.exports = new MedicationsController();
