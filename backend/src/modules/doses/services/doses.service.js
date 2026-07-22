const DoseEvent = require('../models/DoseEvent.model');
const AlarmEvent = require('../models/AlarmEvent.model');
const Medication = require('../../medications/models/Medication.model');
const Patient = require('../../auth/models/Patient.model');
const relationshipsService = require('../../relationships/services/relationships.service');
const alarmsService = require('../../alarms/services/alarms.service');
const AppError = require('../../../shared/utils/AppError');
const { logger } = require('../../../shared/utils/logger');

class DosesService {
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
    } else {
      throw new AppError('Access denied', 403, 'FORBIDDEN', { en: 'Access denied.', ar: 'تم رفض الوصول.' });
    }
  }

  async getDailySchedule(userAccountId, userRole, queryPatientId, dateStr) {
    let patientId;
    let patientDoc = null;

    if (userRole === 'PATIENT') {
      const patient = await Patient.findOne({ accountId: userAccountId });
      if (!patient) throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND', { en: 'Patient not found.', ar: 'المريض غير موجود.' });
      patientId = patient._id;
      patientDoc = patient;
    } else if (userRole === 'FAMILY_CAREGIVER') {
      if (!queryPatientId) throw new AppError('patientId is required for caregivers', 400, 'VALIDATION_ERROR', { en: 'patientId required.', ar: 'معرف المريض مطلوب.' });
      patientId = queryPatientId;
      await this.validateAccess(userAccountId, userRole, patientId, 'canAddMedication');
      patientDoc = await Patient.findById(patientId);
    } else {
      throw new AppError('Forbidden', 403, 'FORBIDDEN', { en: 'Forbidden.', ar: 'ممنوع.' });
    }

    const date = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

    const activeMeds = await Medication.find({ patientId, isActive: true });
    
    for (const med of activeMeds) {
      if (med.expirationDate < startOfDay) continue;
      if (med.schedule.startDate > endOfDay) continue;
      if (med.schedule.endDate && med.schedule.endDate < startOfDay) continue;

      if (med.schedule.frequency === 'DAILY') {
        for (const timeStr of med.schedule.timesOfDay) {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const scheduledTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours, minutes, 0, 0));
          
          const doseEvent = await DoseEvent.findOneAndUpdate(
            { medicationId: med._id, scheduledFor: scheduledTime },
            { $setOnInsert: { patientId, medicationId: med._id, scheduledFor: scheduledTime, status: 'PENDING', escalationState: 'NONE', alarmState: 'SCHEDULED', snoozeCount: 0 } },
            { upsert: true, new: true }
          );

          if (patientDoc) {
            try { await alarmsService.createAlarmForDose(doseEvent, patientDoc); }
            catch (err) { logger.error(err, `Failed to create AlarmEvent for dose ${doseEvent._id}`); }
          }
        }
      }
    }

    const list = await DoseEvent.find({ patientId, scheduledFor: { $gte: startOfDay, $lte: endOfDay } }).populate('medicationId');
    return list.map(item => ({
      doseEventId: item._id,
      medicationId: item.medicationId?._id || item.medicationId,
      medicationName: item.medicationId?.name || 'Unknown Medicine',
      scheduledFor: item.scheduledFor,
      status: item.status,
      alarmState: item.alarmState,
      snoozeCount: item.snoozeCount,
    }));
  }

  async confirmDose(userAccountId, userRole, doseEventId) {
    const dose = await DoseEvent.findById(doseEventId);
    if (!dose) throw new AppError('Dose event not found', 404, 'DOSE_NOT_FOUND', { en: 'Dose not found.', ar: 'الجرعة غير موجودة.' });

    await this.validateAccess(userAccountId, userRole, dose.patientId, 'canAddMedication');

    if (dose.status !== 'PENDING') throw new AppError('Dose is not in PENDING status', 400, 'INVALID_STATUS', { en: 'Not pending.', ar: 'ليس قيد الانتظار.' });

    const med = await Medication.findById(dose.medicationId);
    if (!med) throw new AppError('Medication not found', 404, 'MEDICATION_NOT_FOUND', { en: 'Medication not found.', ar: 'الدواء غير موجود.' });

    if (med.expirationDate < new Date()) throw new AppError('Medication has expired', 400, 'EXPIRED_MEDICATION', { en: 'Expired.', ar: 'منتهي الصلاحية.' });
    if (med.inventory.currentQuantity < med.inventory.doseAmount) throw new AppError('Insufficient medication inventory', 400, 'LOW_STOCK', { en: 'Low stock.', ar: 'مخزون منخفض.' });

    med.inventory.currentQuantity = Math.max(0, med.inventory.currentQuantity - med.inventory.doseAmount);
    await med.save();

    dose.status = 'TAKEN';
    dose.takenAt = new Date();
    dose.alarmState = 'TAKEN';
    await dose.save();

    const alarm = await AlarmEvent.findOne({ doseEventId: dose._id });
    if (alarm && alarm.status !== 'TAKEN') {
      alarm.status = 'TAKEN';
      alarm.finalStateAt = new Date();
      await alarm.save();
    }

    const patient = await Patient.findById(dose.patientId);
    if (patient) await alarmsService._checkLowInventory(patient, med);

    return { doseEventId: dose._id, status: dose.status, takenAt: dose.takenAt, remainingQuantity: med.inventory.currentQuantity };
  }

  async skipDose(userAccountId, userRole, doseEventId) {
    const dose = await DoseEvent.findById(doseEventId);
    if (!dose) throw new AppError('Dose event not found', 404, 'DOSE_NOT_FOUND', { en: 'Dose not found.', ar: 'الجرعة غير موجودة.' });

    await this.validateAccess(userAccountId, userRole, dose.patientId, 'canAddMedication');

    if (dose.status !== 'PENDING') throw new AppError('Dose is not in PENDING status', 400, 'INVALID_STATUS', { en: 'Not pending.', ar: 'ليس قيد الانتظار.' });

    dose.status = 'SKIPPED';
    dose.alarmState = 'MISSED';
    await dose.save();

    const alarm = await AlarmEvent.findOne({ doseEventId: dose._id });
    if (alarm && alarm.status !== 'TAKEN' && alarm.status !== 'MISSED') {
      alarm.status = 'MISSED';
      alarm.finalStateAt = new Date();
      await alarm.save();
    }

    return { doseEventId: dose._id, status: dose.status, skippedAt: new Date() };
  }
}

module.exports = new DosesService();
