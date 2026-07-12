const MedicalCondition = require('../models/MedicalCondition.model');
const Patient = require('../../auth/models/Patient.model');
const relationshipsService = require('../../relationships/services/relationships.service');
const AppError = require('../../../shared/utils/AppError');

class ConditionsService {
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

  async createCondition(userAccountId, userRole, payload) {
    let patientId;

    if (userRole === 'PATIENT') {
      const patient = await Patient.findOne({ accountId: userAccountId });
      if (!patient) {
        throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND');
      }
      patientId = patient._id;
    } else if (userRole === 'CAREGIVER') {
      if (!payload.patientId) {
        throw new AppError('patientId is required for caregivers', 400, 'VALIDATION_ERROR');
      }
      patientId = payload.patientId;
      await this.validateAccess(userAccountId, userRole, patientId, 'canViewMedicalRecords');
    } else {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    const condition = new MedicalCondition({
      patientId,
      diseaseName: payload.diseaseName,
      isChronic: payload.isChronic,
      diagnosedDate: payload.diagnosedDate,
      notes: payload.notes
    });

    await condition.save();
    return condition;
  }

  async listConditions(userAccountId, userRole, targetPatientId) {
    let patientId;

    if (userRole === 'PATIENT') {
      const patient = await Patient.findOne({ accountId: userAccountId });
      if (!patient) {
        throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND');
      }
      patientId = patient._id;
    } else if (userRole === 'CAREGIVER') {
      if (!targetPatientId) {
        throw new AppError('patientId is required for caregivers', 400, 'VALIDATION_ERROR');
      }
      patientId = targetPatientId;
      await this.validateAccess(userAccountId, userRole, patientId, 'canViewMedicalRecords');
    } else {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    return await MedicalCondition.find({ patientId });
  }

  async getCondition(userAccountId, userRole, conditionId) {
    const condition = await MedicalCondition.findById(conditionId);
    if (!condition) {
      throw new AppError('Medical condition not found', 404, 'CONDITION_NOT_FOUND');
    }

    await this.validateAccess(userAccountId, userRole, condition.patientId, 'canViewMedicalRecords');
    return condition;
  }

  async updateCondition(userAccountId, userRole, conditionId, updateData) {
    const condition = await MedicalCondition.findById(conditionId);
    if (!condition) {
      throw new AppError('Medical condition not found', 404, 'CONDITION_NOT_FOUND');
    }

    await this.validateAccess(userAccountId, userRole, condition.patientId, 'canViewMedicalRecords');

    if (updateData.isChronic !== undefined) {
      condition.isChronic = updateData.isChronic;
    }
    if (updateData.diagnosedDate !== undefined) {
      condition.diagnosedDate = updateData.diagnosedDate;
    }
    if (updateData.notes !== undefined) {
      condition.notes = updateData.notes;
    }

    await condition.save();
    return condition;
  }

  async deleteCondition(userAccountId, userRole, conditionId) {
    const condition = await MedicalCondition.findById(conditionId);
    if (!condition) {
      throw new AppError('Medical condition not found', 404, 'CONDITION_NOT_FOUND');
    }

    await this.validateAccess(userAccountId, userRole, condition.patientId, 'canViewMedicalRecords');

    await MedicalCondition.deleteOne({ _id: conditionId });
  }
}

module.exports = new ConditionsService();
