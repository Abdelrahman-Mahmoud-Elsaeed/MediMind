const DoseEvent = require('../models/DoseEvent.model');
const Medication = require('../../medications/models/Medication.model');
const Patient = require('../../auth/models/Patient.model');
const relationshipsService = require('../../relationships/services/relationships.service');
const AppError = require('../../../shared/utils/AppError');

class DosesService {
  async validateAccess(userAccountId, userRole, patientId, requiredPermission) {
    if (userRole === 'PATIENT') {
      const patient = await Patient.findOne({ accountId: userAccountId });
      if (!patient || patient._id.toString() !== patientId.toString()) {
        throw new AppError('Access denied to this patient profile', 403, 'FORBIDDEN');
      }
      return patient;
    } else if (userRole === 'CAREGIVER') {
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

  async getDailySchedule(userAccountId, userRole, queryPatientId, dateStr) {
    let patientId;

    if (userRole === 'PATIENT') {
      const patient = await Patient.findOne({ accountId: userAccountId });
      if (!patient) {
        throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND');
      }
      patientId = patient._id;
    } else if (userRole === 'CAREGIVER') {
      if (!queryPatientId) {
        throw new AppError('patientId is required for caregivers', 400, 'VALIDATION_ERROR');
      }
      patientId = queryPatientId;
      await this.validateAccess(userAccountId, userRole, patientId, 'canAddMedication');
    } else {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    const date = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

    // Auto-generate dose events from schedules for the queried day if none exist yet (helps mock/demo/testing flow)
    const activeMeds = await Medication.find({ patientId, isActive: true });
    
    for (const med of activeMeds) {
      // Expiration check
      if (med.expirationDate < startOfDay) continue;
      
      // Start/End date check
      if (med.schedule.startDate > endOfDay) continue;
      if (med.schedule.endDate && med.schedule.endDate < startOfDay) continue;

      // Frequency check (DAILY or weekly day check)
      // For DAILY, we can generate doses for this day
      if (med.schedule.frequency === 'DAILY') {
        for (const timeStr of med.schedule.timesOfDay) {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const scheduledTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours, minutes, 0, 0));
          
          // Check if dose event already exists for this scheduled time
          const existing = await DoseEvent.findOne({
            medicationId: med._id,
            scheduledFor: scheduledTime
          });

          if (!existing) {
            const dose = new DoseEvent({
              medicationId: med._id,
              patientId,
              scheduledFor: scheduledTime,
              status: 'PENDING',
              escalationState: 'NONE'
            });
            await dose.save();
          }
        }
      }
    }

    // Now find and populate
    const list = await DoseEvent.find({
      patientId,
      scheduledFor: { $gte: startOfDay, $lte: endOfDay }
    }).populate('medicationId');

    return list.map(item => ({
      doseEventId: item._id,
      medicationId: item.medicationId?._id || item.medicationId,
      medicationName: item.medicationId?.name || 'Unknown Medicine',
      scheduledFor: item.scheduledFor,
      status: item.status
    }));
  }

  async confirmDose(userAccountId, userRole, doseEventId) {
    const dose = await DoseEvent.findById(doseEventId);
    if (!dose) {
      throw new AppError('Dose event not found', 404, 'DOSE_NOT_FOUND');
    }

    await this.validateAccess(userAccountId, userRole, dose.patientId, 'canAddMedication');

    if (dose.status !== 'PENDING') {
      throw new AppError('Dose is not in PENDING status', 400, 'INVALID_STATUS');
    }

    const med = await Medication.findById(dose.medicationId);
    if (!med) {
      throw new AppError('Medication not found', 404, 'MEDICATION_NOT_FOUND');
    }

    // Block confirmation if medication has expired
    if (med.expirationDate < new Date()) {
      throw new AppError('Medication has expired', 400, 'EXPIRED_MEDICATION');
    }

    // Block if insufficient inventory
    if (med.inventory.currentQuantity < med.inventory.doseAmount) {
      throw new AppError('Insufficient medication inventory to confirm dose', 400, 'LOW_STOCK');
    }

    // Decrement inventory
    med.inventory.currentQuantity = Math.max(0, med.inventory.currentQuantity - med.inventory.doseAmount);
    await med.save();

    // Confirm dose
    dose.status = 'TAKEN';
    dose.takenAt = new Date();
    await dose.save();

    return {
      doseEventId: dose._id,
      status: dose.status,
      takenAt: dose.takenAt,
      remainingQuantity: med.inventory.currentQuantity
    };
  }

  async skipDose(userAccountId, userRole, doseEventId) {
    const dose = await DoseEvent.findById(doseEventId);
    if (!dose) {
      throw new AppError('Dose event not found', 404, 'DOSE_NOT_FOUND');
    }

    await this.validateAccess(userAccountId, userRole, dose.patientId, 'canAddMedication');

    if (dose.status !== 'PENDING') {
      throw new AppError('Dose is not in PENDING status', 400, 'INVALID_STATUS');
    }

    dose.status = 'SKIPPED';
    await dose.save();

    return {
      doseEventId: dose._id,
      status: dose.status,
      skippedAt: new Date()
    };
  }
}

module.exports = new DosesService();
