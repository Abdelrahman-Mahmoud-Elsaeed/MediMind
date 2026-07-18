const Relationship = require('../models/Relationship.model');
const Patient = require('../../auth/models/Patient.model');
const Caregiver = require('../../auth/models/FamilyCaregiver.model');
const Account = require('../../auth/models/Account.model');
const AppError = require('../../../shared/utils/AppError');

class RelationshipsService {
  async initiateRelationship(patientAccountId, caregiverEmail, permissions) {
    const patient = await Patient.findOne({ accountId: patientAccountId });
    if (!patient) {
      throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND');
    }

    const caregiverAccount = await Account.findOne({ email: caregiverEmail, role: 'CAREGIVER' });
    if (!caregiverAccount) {
      throw new AppError('Caregiver account not found', 404, 'CAREGIVER_NOT_FOUND');
    }

    const caregiver = await Caregiver.findOne({ accountId: caregiverAccount._id });
    if (!caregiver) {
      throw new AppError('Caregiver profile not found', 404, 'CAREGIVER_NOT_FOUND');
    }

    // Check if relationship already exists
    const existing = await Relationship.findOne({ patientId: patient._id, caregiverId: caregiver._id });
    if (existing) {
      if (existing.status === 'PENDING' || existing.status === 'ACCEPTED') {
        throw new AppError('Relationship already active or pending', 400, 'RELATIONSHIP_EXISTS');
      }
      
      // Re-initiate previously revoked/rejected relationship
      existing.status = 'PENDING';
      existing.permissions = permissions;
      await existing.save();
      return existing;
    }

    const relationship = new Relationship({
      patientId: patient._id,
      caregiverId: caregiver._id,
      status: 'PENDING',
      permissions
    });

    await relationship.save();
    return relationship;
  }

  async listRelationships(accountId, role, status) {
    let query = {};
    if (role === 'PATIENT') {
      const patient = await Patient.findOne({ accountId });
      if (!patient) {
        throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND');
      }
      query.patientId = patient._id;
    } else if (role === 'CAREGIVER') {
      const caregiver = await Caregiver.findOne({ accountId });
      if (!caregiver) {
        throw new AppError('Caregiver profile not found', 404, 'CAREGIVER_NOT_FOUND');
      }
      query.caregiverId = caregiver._id;
    } else {
      throw new AppError('Invalid role for relationships', 403, 'FORBIDDEN');
    }

    if (status) {
      query.status = status;
    }

    const list = await Relationship.find(query)
      .populate({ path: 'patientId', select: 'firstName lastName phone' })
      .populate({ path: 'caregiverId', select: 'firstName lastName phone' });

    return list.map(item => ({
      relationshipId: item._id,
      patientId: item.patientId,
      caregiverId: item.caregiverId,
      status: item.status,
      permissions: item.permissions
    }));
  }

  async updateStatus(caregiverAccountId, relationshipId, status) {
    const caregiver = await Caregiver.findOne({ accountId: caregiverAccountId });
    if (!caregiver) {
      throw new AppError('Caregiver profile not found', 404, 'CAREGIVER_NOT_FOUND');
    }

    const relationship = await Relationship.findOne({ _id: relationshipId, caregiverId: caregiver._id });
    if (!relationship) {
      throw new AppError('Relationship not found', 404, 'RELATIONSHIP_NOT_FOUND');
    }

    if (relationship.status !== 'PENDING') {
      throw new AppError('Invitation is not pending', 400, 'INVALID_STATUS');
    }

    relationship.status = status;
    await relationship.save();
    return relationship;
  }

  async revokeRelationship(patientAccountId, relationshipId) {
    const patient = await Patient.findOne({ accountId: patientAccountId });
    if (!patient) {
      throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND');
    }

    const relationship = await Relationship.findOne({ _id: relationshipId, patientId: patient._id });
    if (!relationship) {
      throw new AppError('Relationship not found', 404, 'RELATIONSHIP_NOT_FOUND');
    }

    relationship.status = 'REVOKED';
    await relationship.save();
    return relationship;
  }

  /**
   * Helper to check access in other modules
   */
  async checkCaregiverAccess(patientId, caregiverAccountId, requiredPermission) {
    const caregiver = await Caregiver.findOne({ accountId: caregiverAccountId });
    if (!caregiver) return false;

    const relationship = await Relationship.findOne({
      patientId,
      caregiverId: caregiver._id,
      status: 'ACCEPTED'
    });

    if (!relationship) return false;
    return !!relationship.permissions[requiredPermission];
  }
}

module.exports = new RelationshipsService();
