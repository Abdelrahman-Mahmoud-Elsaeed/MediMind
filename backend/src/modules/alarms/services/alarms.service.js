const AlarmEvent = require('../../doses/models/AlarmEvent.model');
const DoseEvent = require('../../doses/models/DoseEvent.model');
const Medication = require('../../medications/models/Medication.model');
const Patient = require('../../auth/models/Patient.model');
const FamilyCaregiver = require('../../auth/models/FamilyCaregiver.model');
const Account = require('../../auth/models/Account.model');
const Relationship = require('../../relationships/models/Relationship.model');
const relationshipsService = require('../../relationships/services/relationships.service');
const fcmService = require('../../../shared/services/fcm.service');
const AppError = require('../../../shared/utils/AppError');
const { logger } = require('../../../shared/utils/logger');

class AlarmsService {
  async _validateAccess(userAccountId, userRole, patientId, requiredPermission) {
    if (userRole === 'PATIENT') {
      const patient = await Patient.findOne({ accountId: userAccountId });
      if (!patient || patient._id.toString() !== patientId.toString()) {
        throw new AppError('Access denied', 403, 'FORBIDDEN', { en: 'Access denied.', ar: 'تم رفض الوصول.' });
      }
      return patient;
    } else if (userRole === 'FAMILY_CAREGIVER') {
      const has = await relationshipsService.checkCaregiverAccess(patientId, userAccountId, requiredPermission);
      if (!has) throw new AppError('Insufficient permissions', 403, 'FORBIDDEN', { en: 'Insufficient.', ar: 'صلاحيات غير كافية.' });
      return null;
    }
    throw new AppError('Access denied', 403, 'FORBIDDEN', { en: 'Access denied.', ar: 'تم رفض الوصول.' });
  }

  /**
   * Create AlarmEvent for a DoseEvent. Called when daily schedule is generated.
   * The alarm settings (snoozeMinutes, maxSnoozeCount) are NOT stored here —
   * they're fetched from Patient.alarmSettings by the Flutter app.
   */
  async createAlarmForDose(doseEvent, patient) {
    const existing = await AlarmEvent.findOne({ doseEventId: doseEvent._id });
    if (existing) return existing;

    const alarm = new AlarmEvent({
      doseEventId: doseEvent._id,
      medicationId: doseEvent.medicationId,
      patientId: doseEvent.patientId,
      scheduledFor: doseEvent.scheduledFor,
      status: 'SCHEDULED',
    });
    await alarm.save();
    return alarm;
  }

  /**
   * PHONE-DRIVEN: The Flutter app tells the server "the alarm started ringing".
   * This is NOT called by a cron job — the phone knows when to ring.
   */
  async reportAlarmStarted(userAccountId, userRole, alarmEventId) {
    const alarm = await AlarmEvent.findById(alarmEventId);
    if (!alarm) throw new AppError('Alarm not found', 404, 'ALARM_NOT_FOUND', { en: 'Not found.', ar: 'غير موجود.' });

    await this._validateAccess(userAccountId, userRole, alarm.patientId, 'canViewAdherence');

    if (alarm.status === 'SCHEDULED') {
      alarm.status = 'RINGING';
      alarm.alarmTriggeredAt = new Date();
      await alarm.save();
      await DoseEvent.findByIdAndUpdate(alarm.doseEventId, { alarmState: 'RINGING' });
    }
    return alarm;
  }

  /**
   * PHONE-DRIVEN: Patient snoozed the alarm on their phone.
   * snoozeMinutes is read from Patient.alarmSettings (NOT from AlarmEvent).
   */
  async snoozeAlarm(userAccountId, userRole, alarmEventId) {
    const alarm = await AlarmEvent.findById(alarmEventId);
    if (!alarm) throw new AppError('Alarm not found', 404, 'ALARM_NOT_FOUND', { en: 'Not found.', ar: 'غير موجود.' });

    const patient = await this._validateAccess(userAccountId, userRole, alarm.patientId, 'canViewAdherence');

    if (alarm.status === 'TAKEN') throw new AppError('Already taken', 400, 'DOSE_ALREADY_TAKEN', { en: 'Already taken.', ar: 'تم أخذه.' });
    if (alarm.status === 'MISSED') throw new AppError('Already missed', 400, 'DOSE_ALREADY_MISSED', { en: 'Already missed.', ar: 'تم تفويته.' });
    if (alarm.status === 'ESCALATED' || alarm.status === 'ACKNOWLEDGED') throw new AppError('Already escalated', 400, 'ALARM_ESCALATED', { en: 'Already escalated.', ar: 'تم تصعيده.' });

    // Get snooze settings from Patient (NOT from AlarmEvent — no duplication)
    const alarmSettings = patient.alarmSettings || {};
    const maxSnoozeCount = alarmSettings.maxSnoozeCount ?? 6;

    const newSnoozeCount = alarm.snoozeCount + 1;

    // Check if max snoozes reached → escalate to caregiver
    if (newSnoozeCount >= maxSnoozeCount) {
      alarm.snoozeCount = newSnoozeCount;
      alarm.status = 'ESCALATED';
      alarm.escalatedToCaregiverAt = new Date();
      await alarm.save();
      await DoseEvent.findByIdAndUpdate(alarm.doseEventId, { alarmState: 'ESCALATED', snoozeCount: newSnoozeCount });
      await this._notifyCaregiver(alarm);
      return alarm;
    }

    // Normal snooze
    alarm.snoozeCount = newSnoozeCount;
    alarm.status = 'SNOOZED';
    await alarm.save();
    await DoseEvent.findByIdAndUpdate(alarm.doseEventId, { alarmState: 'SNOOZED', snoozeCount: newSnoozeCount });
    return alarm;
  }

  async dismissAlarm(userAccountId, userRole, alarmEventId) {
    return this.snoozeAlarm(userAccountId, userRole, alarmEventId);
  }

  /**
   * PHONE-DRIVEN: Patient pressed "Taken" on the alarm screen.
   */
  async confirmTaken(userAccountId, userRole, alarmEventId) {
    const alarm = await AlarmEvent.findById(alarmEventId);
    if (!alarm) throw new AppError('Alarm not found', 404, 'ALARM_NOT_FOUND', { en: 'Not found.', ar: 'غير موجود.' });
    const patient = await this._validateAccess(userAccountId, userRole, alarm.patientId, 'canAddMedication');

    if (alarm.status === 'TAKEN') throw new AppError('Already taken', 400, 'DOSE_ALREADY_TAKEN', { en: 'Already taken.', ar: 'تم أخذه.' });
    if (alarm.status === 'MISSED') throw new AppError('Already missed', 400, 'DOSE_ALREADY_MISSED', { en: 'Already missed.', ar: 'تم تفويته.' });

    const doseEvent = await DoseEvent.findById(alarm.doseEventId);
    if (!doseEvent) throw new AppError('Dose not found', 404, 'DOSE_NOT_FOUND', { en: 'Not found.', ar: 'غير موجود.' });
    if (doseEvent.status !== 'PENDING') throw new AppError('Not PENDING', 400, 'INVALID_STATUS', { en: 'Not pending.', ar: 'ليس قيد الانتظار.' });

    const med = await Medication.findById(alarm.medicationId);
    if (!med) throw new AppError('Medication not found', 404, 'MEDICATION_NOT_FOUND', { en: 'Not found.', ar: 'غير موجود.' });
    if (med.expirationDate < new Date()) throw new AppError('Expired', 400, 'EXPIRED_MEDICATION', { en: 'Expired.', ar: 'منتهي الصلاحية.' });
    if (med.inventory.currentQuantity < med.inventory.doseAmount) throw new AppError('Low stock', 400, 'LOW_STOCK', { en: 'Low stock.', ar: 'مخزون منخفض.' });

    med.inventory.currentQuantity = Math.max(0, med.inventory.currentQuantity - med.inventory.doseAmount);
    await med.save();

    doseEvent.status = 'TAKEN'; doseEvent.takenAt = new Date(); doseEvent.alarmState = 'TAKEN'; doseEvent.snoozeCount = alarm.snoozeCount;
    await doseEvent.save();

    alarm.status = 'TAKEN'; alarm.finalStateAt = new Date();
    await alarm.save();

    await this._checkLowInventory(patient, med);
    return { alarmEventId: alarm._id, doseEventId: doseEvent._id, status: 'TAKEN', takenAt: doseEvent.takenAt, snoozeCount: alarm.snoozeCount, remainingQuantity: med.inventory.currentQuantity };
  }

  async acknowledgeAlarm(userAccountId, userRole, alarmEventId) {
    const alarm = await AlarmEvent.findById(alarmEventId);
    if (!alarm) throw new AppError('Alarm not found', 404, 'ALARM_NOT_FOUND', { en: 'Not found.', ar: 'غير موجود.' });
    let caregiverProfile = null;
    if (userRole === 'FAMILY_CAREGIVER') {
      caregiverProfile = await FamilyCaregiver.findOne({ accountId: userAccountId });
      if (!caregiverProfile) throw new AppError('Caregiver not found', 404, 'PROFILE_NOT_FOUND', { en: 'Not found.', ar: 'غير موجود.' });
      const has = await relationshipsService.checkCaregiverAccess(alarm.patientId, userAccountId, 'canViewAdherence');
      if (!has) throw new AppError('Insufficient permissions', 403, 'FORBIDDEN', { en: 'Insufficient.', ar: 'صلاحيات غير كافية.' });
    } else if (userRole === 'PATIENT') {
      const p = await Patient.findOne({ accountId: userAccountId });
      if (!p || p._id.toString() !== alarm.patientId.toString()) throw new AppError('Access denied', 403, 'FORBIDDEN', { en: 'Access denied.', ar: 'تم رفض الوصول.' });
    } else throw new AppError('Only caregivers or patients', 403, 'FORBIDDEN', { en: 'Only caregivers or patients.', ar: 'فقط مقدمو الرعاية أو المرضى.' });

    if (alarm.status !== 'ESCALATED') throw new AppError('Not escalated', 400, 'INVALID_ALARM_STATE', { en: 'Not escalated.', ar: 'ليس مصعداً.' });
    alarm.status = 'ACKNOWLEDGED'; alarm.acknowledgedByCaregiverAt = new Date();
    if (caregiverProfile) alarm.acknowledgedByCaregiverId = caregiverProfile._id;
    await alarm.save();
    await DoseEvent.findByIdAndUpdate(alarm.doseEventId, { alarmState: 'ACKNOWLEDGED' });
    return { alarmEventId: alarm._id, status: 'ACKNOWLEDGED', acknowledgedAt: alarm.acknowledgedByCaregiverAt };
  }

  /**
   * DAILY CRON: Check for patients who missed doses 3 consecutive days → escalate to doctor.
   * This replaces the per-minute escalation check.
   */
  async checkConsecutiveMissedDays() {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    // Find patients who have MISSED doses in the last 3 consecutive days
    const patientsWithMissedStreak = await DoseEvent.aggregate([
      {
        $match: {
          status: 'MISSED',
          scheduledFor: { $gte: threeDaysAgo },
        },
      },
      {
        $group: {
          _id: '$patientId',
          missedCount: { $sum: 1 },
          missedDates: { $addToSet: { $dateToString: { format: '%Y-%m-%d', date: '$scheduledFor' } } },
        },
      },
      {
        $match: {
          missedDates: { $size: { $gte: 3 } }, // At least 3 different days with missed doses
        },
      },
    ]);

    let escalated = 0;
    for (const record of patientsWithMissedStreak) {
      const patient = await Patient.findById(record._id).lean();
      if (!patient) continue;

      // Check if already escalated to doctor recently
      const recentEscalation = await AlarmEvent.findOne({
        patientId: record._id,
        escalatedToDoctorAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      if (!recentEscalation) {
        // Find the latest missed alarm for this patient
        const latestMissed = await AlarmEvent.findOne({
          patientId: record._id,
          status: 'MISSED',
        }).sort({ createdAt: -1 });

        if (latestMissed) {
          latestMissed.escalatedToDoctorAt = new Date();
          await latestMissed.save();
          escalated++;
          logger.warn(`[DoctorEscalation] Patient ${record._id} missed doses ${record.missedCount} times in 3 days. Escalated to doctor.`);
        }
      }
    }

    logger.info(`[DailyCheck] Consecutive missed days scan: ${escalated} doctor escalations.`);
    return { scanned: patientsWithMissedStreak.length, escalated };
  }

  async _notifyCaregiver(alarm) {
    const patient = await Patient.findById(alarm.patientId).lean();
    if (!patient) return;
    const medication = await Medication.findById(alarm.medicationId).lean();
    const medName = medication?.name || 'دواء';
    const caregiverRels = await Relationship.find({ patientId: alarm.patientId, status: 'ACCEPTED' }).populate('caregiverId');
    for (const rel of caregiverRels) {
      const caregiver = rel.caregiverId;
      if (!caregiver) continue;
      if (caregiver.alertSettings?.instantMissed === false) continue;
      const account = await Account.findById(caregiver.accountId).lean();
      if (account) {
        await fcmService.sendCaregiverEscalation(account._id, {
          patientName: `${patient.firstName} ${patient.lastName}`,
          medicationName: medName,
          scheduledFor: alarm.scheduledFor,
          snoozeCount: alarm.snoozeCount,
        });
      }
    }
  }

  async _checkLowInventory(patient, medication) {
    if (!medication || !medication.inventory) return false;
    const { currentQuantity, refillThreshold } = medication.inventory;
    if (currentQuantity > refillThreshold) return false;
    const account = await Account.findById(patient.accountId).lean();
    if (!account) return false;
    await fcmService.sendLowInventoryAlert(account._id, { medicationName: medication.name, currentQuantity, refillThreshold });
    return true;
  }

  async getAlarmByDose(userAccountId, userRole, doseEventId) {
    const alarm = await AlarmEvent.findOne({ doseEventId }).lean();
    if (!alarm) return null;
    await this._validateAccess(userAccountId, userRole, alarm.patientId, 'canViewMedicalRecords');
    return alarm;
  }

  async getActiveAlarms(userAccountId, userRole, queryPatientId) {
    let patientId;
    if (userRole === 'PATIENT') {
      const p = await Patient.findOne({ accountId: userAccountId });
      if (!p) throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND', { en: 'Not found.', ar: 'غير موجود.' });
      patientId = p._id;
    } else if (userRole === 'FAMILY_CAREGIVER') {
      if (!queryPatientId) throw new AppError('patientId required', 400, 'VALIDATION_ERROR', { en: 'patientId required.', ar: 'معرف المريض مطلوب.' });
      patientId = queryPatientId;
      await this._validateAccess(userAccountId, userRole, patientId, 'canViewAdherence');
    } else throw new AppError('Forbidden', 403, 'FORBIDDEN', { en: 'Forbidden.', ar: 'ممنوع.' });
    return await AlarmEvent.find({ patientId, status: { $in: ['RINGING', 'SNOOZED', 'ESCALATED', 'ACKNOWLEDGED'] } }).populate('medicationId', 'name formType').sort({ scheduledFor: 1 }).lean();
  }
}

module.exports = new AlarmsService();
