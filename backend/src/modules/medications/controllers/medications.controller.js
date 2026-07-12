const medicationsService = require('../services/medications.service');
const { logger } = require('../../../shared/utils/logger');

class MedicationsController {
  async create(req, res, next) {
    try {
      const medication = await medicationsService.createMedication(
        req.accountId,
        req.role,
        req.body
      );
      res.status(201).json({
        success: true,
        data: {
          medicationId: medication._id,
          name: medication.name,
          status: 'CREATED'
        }
      });
    } catch (error) {
      logger.error('Error creating medication:', error);
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const patientId = req.query.patientId || null;
      const isActiveParam = req.query.isActive;
      const isActive = isActiveParam !== undefined ? isActiveParam === 'true' : undefined;

      const list = await medicationsService.listMedications(
        req.accountId,
        req.role,
        patientId,
        isActive
      );
      
      const formattedList = list.map(med => ({
        medicationId: med._id,
        conditionId: med.conditionId,
        name: med.name,
        formType: med.formType,
        isChronic: med.isChronic,
        inventory: {
          currentQuantity: med.inventory.currentQuantity,
          doseAmount: med.inventory.doseAmount,
          refillThreshold: med.inventory.refillThreshold
        },
        instructions: med.instructions,
        schedule: {
          frequency: med.schedule.frequency,
          timesOfDay: med.schedule.timesOfDay
        }
      }));

      res.status(200).json({
        success: true,
        data: formattedList
      });
    } catch (error) {
      logger.error('Error listing medications:', error);
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const { medicationId } = req.params;
      const med = await medicationsService.getMedication(
        req.accountId,
        req.role,
        medicationId
      );
      
      res.status(200).json({
        success: true,
        data: {
          medicationId: med._id,
          conditionId: med.conditionId,
          name: med.name,
          formType: med.formType,
          isChronic: med.isChronic,
          inventory: med.inventory,
          instructions: med.instructions,
          schedule: med.schedule,
          expirationDate: med.expirationDate,
          isActive: med.isActive
        }
      });
    } catch (error) {
      logger.error('Error getting medication:', error);
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { medicationId } = req.params;
      const med = await medicationsService.updateMedication(
        req.accountId,
        req.role,
        medicationId,
        req.body
      );
      
      res.status(200).json({
        success: true,
        data: {
          medicationId: med._id,
          name: med.name,
          formType: med.formType,
          isChronic: med.isChronic,
          inventory: med.inventory,
          instructions: med.instructions,
          schedule: {
            frequency: med.schedule.frequency,
            timesOfDay: med.schedule.timesOfDay
          },
          expirationDate: med.expirationDate,
          isActive: med.isActive
        }
      });
    } catch (error) {
      logger.error('Error updating medication:', error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { medicationId } = req.params;
      await medicationsService.deleteMedication(
        req.accountId,
        req.role,
        medicationId
      );
      res.status(204).end();
    } catch (error) {
      logger.error('Error deleting medication:', error);
      next(error);
    }
  }

  async scan(req, res, next) {
    try {
      const { imageBase64 } = req.body;
      const result = await medicationsService.scanMedication(imageBase64);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error scanning medication:', error);
      next(error);
    }
  }
}

module.exports = new MedicationsController();
