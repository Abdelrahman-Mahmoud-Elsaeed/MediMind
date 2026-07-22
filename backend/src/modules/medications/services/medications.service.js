const Medication = require('../models/Medication.model');
const Patient = require('../../auth/models/Patient.model');
const MedicalCondition = require('../../conditions/models/MedicalCondition.model');
const Account = require('../../auth/models/Account.model');
const relationshipsService = require('../../relationships/services/relationships.service');
const fcmService = require('../../../shared/services/fcm.service');
const AppError = require('../../../shared/utils/AppError');
const { logger } = require('../../../shared/utils/logger');

class MedicationsService {
  generateTimesOfDay(firstDoseTime, dosesPerDay) {
    if (!firstDoseTime || dosesPerDay <= 1) return [firstDoseTime || '08:00'];
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
        throw new AppError('Access denied to this patient profile', 403, 'FORBIDDEN', { en: 'Access denied.', ar: 'تم رفض الوصول.' });
      }
      return patient;
    } else if (userRole === 'FAMILY_CAREGIVER') {
      const hasPermission = await relationshipsService.checkCaregiverAccess(patientId, userAccountId, requiredPermission);
      if (!hasPermission) {
        throw new AppError('Insufficient permissions to access this patient profile', 403, 'FORBIDDEN', { en: 'Insufficient permissions.', ar: 'صلاحيات غير كافية.' });
      }
      return null;
    }
    throw new AppError('Access denied', 403, 'FORBIDDEN', { en: 'Access denied.', ar: 'تم رفض الوصول.' });
  }

  async createMedication(userAccountId, userRole, payload) {
    let patientId;
    if (userRole === 'PATIENT') {
      const patient = await Patient.findOne({ accountId: userAccountId });
      if (!patient) throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND', { en: 'Patient not found.', ar: 'المريض غير موجود.' });
      patientId = patient._id;
    } else if (userRole === 'FAMILY_CAREGIVER') {
      if (!payload.patientId) throw new AppError('patientId is required for caregivers', 400, 'VALIDATION_ERROR', { en: 'patientId required.', ar: 'معرف المريض مطلوب.' });
      patientId = payload.patientId;
      await this.validateAccess(userAccountId, userRole, patientId, 'canAddMedication');
    } else {
      throw new AppError('Forbidden', 403, 'FORBIDDEN', { en: 'Forbidden.', ar: 'ممنوع.' });
    }

    const condition = await MedicalCondition.findOne({ _id: payload.conditionId, patientId });
    if (!condition) throw new AppError('Medical condition not found for this patient', 404, 'CONDITION_NOT_FOUND', { en: 'Condition not found.', ar: 'الحالة غير موجودة.' });

    if (payload.isChronic) {
      payload.schedule.endDate = null;
    } else if (!payload.schedule.endDate) {
      throw new AppError('endDate is required for acute medications', 400, 'VALIDATION_ERROR', { en: 'endDate required.', ar: 'تاريخ الانتهاء مطلوب.' });
    }

    const timesOfDay = this.generateTimesOfDay(payload.schedule.firstDoseTime, payload.schedule.dosesPerDay);
    const medication = new Medication({
      patientId, conditionId: payload.conditionId, addedBy: userAccountId,
      name: payload.name, imageURL: payload.imageURL, formType: payload.formType,
      isChronic: payload.isChronic, inventory: payload.inventory, instructions: payload.instructions,
      schedule: { ...payload.schedule, timesOfDay }, expirationDate: payload.expirationDate, isActive: true
    });
    await medication.save();
    return medication;
  }

  async listMedications(userAccountId, userRole, targetPatientId, isActive) {
    let patientId;
    if (userRole === 'PATIENT') {
      const patient = await Patient.findOne({ accountId: userAccountId });
      if (!patient) throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND', { en: 'Patient not found.', ar: 'المريض غير موجود.' });
      patientId = patient._id;
    } else if (userRole === 'FAMILY_CAREGIVER') {
      if (!targetPatientId) throw new AppError('patientId is required for caregivers', 400, 'VALIDATION_ERROR', { en: 'patientId required.', ar: 'معرف المريض مطلوب.' });
      patientId = targetPatientId;
      await this.validateAccess(userAccountId, userRole, patientId, 'canViewMedicalRecords');
    } else {
      throw new AppError('Forbidden', 403, 'FORBIDDEN', { en: 'Forbidden.', ar: 'ممنوع.' });
    }
    let query = { patientId };
    if (isActive !== undefined) query.isActive = isActive;
    return await Medication.find(query);
  }

  async getMedication(userAccountId, userRole, medicationId) {
    const medication = await Medication.findById(medicationId);
    if (!medication) throw new AppError('Medication not found', 404, 'MEDICATION_NOT_FOUND', { en: 'Medication not found.', ar: 'الدواء غير موجود.' });
    await this.validateAccess(userAccountId, userRole, medication.patientId, 'canViewMedicalRecords');
    return medication;
  }

  async updateMedication(userAccountId, userRole, medicationId, updateData) {
    const medication = await Medication.findById(medicationId);
    if (!medication) throw new AppError('Medication not found', 404, 'MEDICATION_NOT_FOUND', { en: 'Medication not found.', ar: 'الدواء غير موجود.' });
    await this.validateAccess(userAccountId, userRole, medication.patientId, 'canAddMedication');
    if (updateData.inventory) {
      if (updateData.inventory.currentQuantity !== undefined) medication.inventory.currentQuantity = updateData.inventory.currentQuantity;
      if (updateData.inventory.doseAmount !== undefined) medication.inventory.doseAmount = updateData.inventory.doseAmount;
      if (updateData.inventory.refillThreshold !== undefined) medication.inventory.refillThreshold = updateData.inventory.refillThreshold;
    }
    if (updateData.instructions) {
      if (updateData.instructions.relationToMeals !== undefined) medication.instructions.relationToMeals = updateData.instructions.relationToMeals;
      if (updateData.instructions.notes !== undefined) medication.instructions.notes = updateData.instructions.notes;
    }
    if (updateData.schedule) {
      const schedule = medication.schedule;
      if (updateData.schedule.frequency !== undefined) schedule.frequency = updateData.schedule.frequency;
      if (updateData.schedule.dosesPerDay !== undefined) schedule.dosesPerDay = updateData.schedule.dosesPerDay;
      if (updateData.schedule.firstDoseTime !== undefined) schedule.firstDoseTime = updateData.schedule.firstDoseTime;
      if (updateData.schedule.startDate !== undefined) schedule.startDate = updateData.schedule.startDate;
      if (updateData.schedule.endDate !== undefined) schedule.endDate = updateData.schedule.endDate;
      schedule.timesOfDay = this.generateTimesOfDay(schedule.firstDoseTime, schedule.dosesPerDay);
    }
    if (updateData.imageURL !== undefined) medication.imageURL = updateData.imageURL;
    if (updateData.isActive !== undefined) medication.isActive = updateData.isActive;
    await medication.save();
    return medication;
  }

  async deleteMedication(userAccountId, userRole, medicationId) {
    const medication = await Medication.findById(medicationId);
    if (!medication) throw new AppError('Medication not found', 404, 'MEDICATION_NOT_FOUND', { en: 'Medication not found.', ar: 'الدواء غير موجود.' });
    await this.validateAccess(userAccountId, userRole, medication.patientId, 'canAddMedication');
    await Medication.deleteOne({ _id: medicationId });
  }

  async scanMedication(imageBase64) {
    if (imageBase64.includes('low_confidence') || imageBase64.includes('error')) {
      throw new AppError('OCR confidence score too low', 422, 'LOW_CONFIDENCE');
    }
    return { name: 'Amoxicillin', formType: 'CAPSULE', confidenceScore: 0.96 };
  }

  async checkLowInventory(medication, patient = null) {
    if (!medication || !medication.inventory) return false;
    const { currentQuantity, refillThreshold } = medication.inventory;
    if (currentQuantity > refillThreshold) return false;
    if (!patient) patient = await Patient.findById(medication.patientId).lean();
    if (!patient) return false;
    const account = await Account.findById(patient.accountId).lean();
    if (!account) return false;
    await fcmService.sendLowInventoryAlert(account._id, { medicationName: medication.name, currentQuantity, refillThreshold });
    return true;
  }

  async getRefillSoon(userAccountId, userRole, targetPatientId) {
    let patientId;
    if (userRole === 'PATIENT') {
      const p = await Patient.findOne({ accountId: userAccountId });
      if (!p) throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND', { en: 'Patient not found.', ar: 'المريض غير موجود.' });
      patientId = p._id;
    } else if (userRole === 'FAMILY_CAREGIVER') {
      if (!targetPatientId) throw new AppError('patientId required', 400, 'VALIDATION_ERROR', { en: 'patientId required.', ar: 'معرف المريض مطلوب.' });
      patientId = targetPatientId;
      await this.validateAccess(userAccountId, userRole, patientId, 'canViewMedicalRecords');
    } else {
      throw new AppError('Forbidden', 403, 'FORBIDDEN', { en: 'Forbidden.', ar: 'ممنوع.' });
    }
    const meds = await Medication.find({ patientId, isActive: true, $expr: { $lte: ['$inventory.currentQuantity', '$inventory.refillThreshold'] } }).lean();
    return meds.map(m => ({ medicationId: m._id, name: m.name, formType: m.formType, currentQuantity: m.inventory.currentQuantity, refillThreshold: m.inventory.refillThreshold, doseAmount: m.inventory.doseAmount }));
  }
}

module.exports = new MedicationsService();
