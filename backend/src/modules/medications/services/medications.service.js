const Medication = require('../models/Medication.model');
const Patient = require('../../auth/models/Patient.model');
const MedicalCondition = require('../../conditions/models/MedicalCondition.model');
const relationshipsService = require('../../relationships/services/relationships.service');
const geminiService = require('./gemini.service');
const AppError = require('../../../shared/utils/AppError');
const { logger } = require('../../../shared/utils/logger');

class MedicationsService {
  generateTimesOfDay(firstDoseTime, dosesPerDay) {
    if (!firstDoseTime || dosesPerDay <= 1) return [firstDoseTime || "08:00"];
    const times = [];
    const [hours, minutes] = firstDoseTime.split(':').map(Number);
    const intervalHours = 24 / dosesPerDay;
    for (let i = 0; i < dosesPerDay; i++) {
      const totalMinutes = (hours * 60 + minutes + Math.round(i * intervalHours * 60)) % 1440;
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
    return times;
  }

  async validateAccess(userAccountId, userRole, patientId, requiredPermission) {
    if (userRole === 'PATIENT') {
      const patient = await Patient.findOne({ accountId: userAccountId });
      if (!patient || patient._id.toString() !== patientId.toString()) {
        throw new AppError('Access denied to this patient profile', 403, 'FORBIDDEN');
      }
      return patient;
    } else if (['FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER'].includes(userRole)) {
      const hasPermission = await relationshipsService.checkCaregiverAccess(
        patientId,
        userAccountId,
        requiredPermission
      );
      if (!hasPermission) {
        throw new AppError('Insufficient permissions to access this patient profile', 403, 'FORBIDDEN');
      }
      return null;
    } else {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }
  }

  async createMedication(userAccountId, userRole, payload) {
    let patientId;

    if (userRole === 'PATIENT') {
      const patient = await Patient.findOne({ accountId: userAccountId });
      if (!patient) {
        throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND');
      }
      patientId = patient._id;
    } else if (['FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER'].includes(userRole)) {
      if (!payload.patientId) {
        throw new AppError('patientId is required for caregivers', 400, 'VALIDATION_ERROR');
      }
      patientId = payload.patientId;
      await this.validateAccess(userAccountId, userRole, patientId, 'canAddMedication');
    } else {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    // Verify condition exists if provided
    if (payload.conditionId) {
      const condition = await MedicalCondition.findOne({ _id: payload.conditionId, patientId });
      if (!condition) {
        throw new AppError('Medical condition not found for this patient', 404, 'CONDITION_NOT_FOUND');
      }
    }

    // Validate chronic / endDate logic
    if (payload.isChronic) {
      payload.schedule.endDate = null;
    } else if (!payload.schedule.endDate) {
      const start = payload.schedule?.startDate ? new Date(payload.schedule.startDate) : new Date();
      payload.schedule.endDate = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Generate times of day
    const timesOfDay = this.generateTimesOfDay(
      payload.schedule.firstDoseTime,
      payload.schedule.dosesPerDay
    );

    const medication = new Medication({
      patientId,
      conditionId: payload.conditionId || null,
      addedBy: userAccountId,
      name: payload.name,
      imageURL: payload.imageURL,
      formType: payload.formType,
      isChronic: payload.isChronic,
      inventory: payload.inventory,
      instructions: payload.instructions,
      schedule: {
        ...payload.schedule,
        timesOfDay
      },
      expirationDate: payload.expirationDate,
      isActive: true
    });

    await medication.save();
    return medication;
  }

  async listMedications(userAccountId, userRole, targetPatientId, isActive) {
    let patientId;

    if (userRole === 'PATIENT') {
      const patient = await Patient.findOne({ accountId: userAccountId });
      if (!patient) {
        throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND');
      }
      patientId = patient._id;
    } else if (['FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER'].includes(userRole)) {
      if (!targetPatientId) {
        throw new AppError('patientId is required for caregivers', 400, 'VALIDATION_ERROR');
      }
      patientId = targetPatientId;
      await this.validateAccess(userAccountId, userRole, patientId, 'canAddMedication');
    } else {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    let query = { patientId };
    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    return await Medication.find(query);
  }

  async getMedication(userAccountId, userRole, medicationId) {
    const medication = await Medication.findById(medicationId);
    if (!medication) {
      throw new AppError('Medication not found', 404, 'MEDICATION_NOT_FOUND');
    }

    await this.validateAccess(userAccountId, userRole, medication.patientId, 'canAddMedication');
    return medication;
  }

  async updateMedication(userAccountId, userRole, medicationId, updateData) {
    const medication = await Medication.findById(medicationId);
    if (!medication) {
      throw new AppError('Medication not found', 404, 'MEDICATION_NOT_FOUND');
    }

    await this.validateAccess(userAccountId, userRole, medication.patientId, 'canAddMedication');

    // Update inventory
    if (updateData.inventory) {
      if (updateData.inventory.currentQuantity !== undefined) {
        medication.inventory.currentQuantity = updateData.inventory.currentQuantity;
      }
      if (updateData.inventory.doseAmount !== undefined) {
        medication.inventory.doseAmount = updateData.inventory.doseAmount;
      }
      if (updateData.inventory.refillThreshold !== undefined) {
        medication.inventory.refillThreshold = updateData.inventory.refillThreshold;
      }
    }

    // Update instructions
    if (updateData.instructions) {
      if (updateData.instructions.relationToMeals !== undefined) {
        medication.instructions.relationToMeals = updateData.instructions.relationToMeals;
      }
      if (updateData.instructions.notes !== undefined) {
        medication.instructions.notes = updateData.instructions.notes;
      }
    }

    // Update schedule
    if (updateData.schedule) {
      const schedule = medication.schedule;
      if (updateData.schedule.frequency !== undefined) {
        schedule.frequency = updateData.schedule.frequency;
      }
      if (updateData.schedule.dosesPerDay !== undefined) {
        schedule.dosesPerDay = updateData.schedule.dosesPerDay;
      }
      if (updateData.schedule.firstDoseTime !== undefined) {
        schedule.firstDoseTime = updateData.schedule.firstDoseTime;
      }
      if (updateData.schedule.startDate !== undefined) {
        schedule.startDate = updateData.schedule.startDate;
      }
      if (updateData.schedule.endDate !== undefined) {
        schedule.endDate = updateData.schedule.endDate;
      }

      // Re-generate times of day
      schedule.timesOfDay = this.generateTimesOfDay(
        schedule.firstDoseTime,
        schedule.dosesPerDay
      );
    }

    if (updateData.imageURL !== undefined) {
      medication.imageURL = updateData.imageURL;
    }

    if (updateData.isActive !== undefined) {
      medication.isActive = updateData.isActive;
    }

    await medication.save();
    return medication;
  }

  async deleteMedication(userAccountId, userRole, medicationId) {
    const medication = await Medication.findById(medicationId);
    if (!medication) {
      throw new AppError('Medication not found', 404, 'MEDICATION_NOT_FOUND');
    }

    await this.validateAccess(userAccountId, userRole, medication.patientId, 'canAddMedication');

    // Archive or Delete: The requirement says return 204 No Content. Let's delete the record.
    await Medication.deleteOne({ _id: medicationId });
  }

  async scanMedication(imageBase64) {
    return await geminiService.extractMedicationsFromImage(imageBase64);
  }
}

module.exports = new MedicationsService();
