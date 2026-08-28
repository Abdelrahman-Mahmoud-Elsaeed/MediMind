const medicationsService = require('../services/medications.service');
const ServiceResponse = require('../../../shared/utils/ServiceResponse');
const { logger } = require('../../../shared/utils/logger');

class MedicationsController {
  async create(req, res, next) {
    try {
      const medication = await medicationsService.createMedication(
        req.accountId,
        req.role,
        req.body
      );
      return new ServiceResponse({
        status: 'CREATED',
        en: 'Medication added successfully.',
        ar: 'تمت إضافة الدواء بنجاح.',
        data: {
          medicationId: medication._id,
          name: medication.name,
          status: 'CREATED'
        }
      }).send(res);
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

      return new ServiceResponse({
        en: 'Medications retrieved successfully.',
        ar: 'تم استرجاع الأدوية بنجاح.',
        data: formattedList
      }).send(res);
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
      
      return new ServiceResponse({
        en: 'Medication details retrieved successfully.',
        ar: 'تم استرجاع تفاصيل الدواء بنجاح.',
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
      }).send(res);
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
      
      return new ServiceResponse({
        en: 'Medication updated successfully.',
        ar: 'تم تحديث الدواء بنجاح.',
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
      }).send(res);
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
      return new ServiceResponse({
        en: 'Medication deleted successfully.',
        ar: 'تم حذف الدواء بنجاح.',
        data: {}
      }).send(res);
    } catch (error) {
      logger.error('Error deleting medication:', error);
      next(error);
    }
  }

  async scan(req, res, next) {
    try {
      const { imageBase64 } = req.body;
      const result = await medicationsService.scanMedication(imageBase64);
      return new ServiceResponse({
        en: 'Medication prescription scanned successfully via AI.',
        ar: 'تم مسح الوصفة الطبية بنجاح بواسطة الذكاء الاصطناعي.',
        data: result
      }).send(res);
    } catch (error) {
      logger.error('Error scanning medication:', error);
      next(error);
    }
  }
}

module.exports = new MedicationsController();
