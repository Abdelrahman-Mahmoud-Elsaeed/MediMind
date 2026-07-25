const Relationship = require('../models/Relationship.model');
const Patient = require('../../auth/models/Patient.model');
const Caregiver = require('../../auth/models/FamilyCaregiver.model');
const Account = require('../../auth/models/Account.model');
const AppError = require('../../../shared/utils/AppError');
const { DEFAULT_PERMISSIONS_BY_MODEL, ALLOWED_STATUS_TRANSITIONS } = require('../constants/relationship.constants');

class RelationshipsService {
  /**
   * Initiates a relationship connection between a patient and a caregiver/doctor/pharmacist.
   */
  async initiateRelationship(patientAccountId, caregiverEmail, relation, permissions) {
    const patient = await Patient.findOne({ accountId: patientAccountId });
    if (!patient) {
      throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND');
    }

    const caregiverAccount = await Account.findOne({ email: caregiverEmail });
    if (!caregiverAccount) {
      throw new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND');
    }

    let caregiver;
    let caregiverType;

    // Dynamically resolve caregiver model
    if (caregiverAccount.role === 'CAREGIVER' || caregiverAccount.role === 'FAMILY_CAREGIVER') {
      caregiver = await Caregiver.findOne({ accountId: caregiverAccount._id });
      caregiverType = 'FamilyCaregiver';
    } else if (caregiverAccount.role === 'PROFESSIONAL_CAREGIVER') {
      const ProfessionalCaregiver = require('../../auth/models/ProfessionalCaregiver.model');
      caregiver = await ProfessionalCaregiver.findOne({ accountId: caregiverAccount._id });
      caregiverType = 'ProfessionalCaregiver';
    } else if (caregiverAccount.role === 'DOCTOR') {
      const Doctor = require('../../auth/models/Doctor.model');
      caregiver = await Doctor.findOne({ accountId: caregiverAccount._id });
      caregiverType = 'Doctor';
    }

    if (!caregiver) {
      throw new AppError('Caregiver profile not found', 404, 'CAREGIVER_NOT_FOUND');
    }

    // Check if relationship already exists and is not soft deleted
    const existing = await Relationship.findOne({
      patientId: patient._id,
      caregiverId: caregiver._id,
      caregiverType,
      deletedAt: null
    });

    if (existing) {
      // Prevent duplicate pending invitations
      if (existing.status === 'PENDING') {
        return existing;
      }
      if (existing.status === 'ACCEPTED') {
        throw new AppError('Relationship already active', 400, 'RELATIONSHIP_EXISTS');
      }

      // Re-initiate relationship from REJECTED or REVOKED state
      const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[existing.status];
      if (allowedTransitions && allowedTransitions.includes('PENDING')) {
        existing.status = 'PENDING';
        existing.relation = relation;
        existing.permissions = permissions || DEFAULT_PERMISSIONS_BY_MODEL[caregiverType];
        await existing.save();
        return existing;
      }
      throw new AppError(`Cannot re-initiate relationship from state: ${existing.status}`, 400, 'INVALID_TRANSITION');
    }

    const relationship = new Relationship({
      patientId: patient._id,
      caregiverId: caregiver._id,
      caregiverType,
      relation,
      status: 'PENDING',
      permissions: permissions || DEFAULT_PERMISSIONS_BY_MODEL[caregiverType]
    });

    await relationship.save();
    return relationship;
  }

  /**
   * Lists all active relationships filtered by role and status.
   */
  async listRelationships(accountId, role, status) {
    let query = { deletedAt: null };

    if (role === 'PATIENT') {
      const patient = await Patient.findOne({ accountId });
      if (!patient) {
        throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND');
      }
      query.patientId = patient._id;
    } else if (['CAREGIVER', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'DOCTOR', 'PHARMACIST'].includes(role)) {
      let caregiver = await Caregiver.findOne({ accountId });
      if (!caregiver) {
        const ProfessionalCaregiver = require('../../auth/models/ProfessionalCaregiver.model');
        caregiver = await ProfessionalCaregiver.findOne({ accountId });
      }
      if (!caregiver) {
        const Doctor = require('../../auth/models/Doctor.model');
        caregiver = await Doctor.findOne({ accountId });
      }
      if (!caregiver) {
        const Pharmacist = require('../../auth/models/Pharmacist.model');
        caregiver = await Pharmacist.findOne({ accountId });
      }
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
      relation: item.relation,
      status: item.status,
      permissions: item.permissions
    }));
  }

  /**
   * Updates status of an invitation (e.g. Caregiver accepting/rejecting the request).
   */
  async updateStatus(caregiverAccountId, relationshipId, status) {
    let caregiver = await Caregiver.findOne({ accountId: caregiverAccountId });
    if (!caregiver) {
      const ProfessionalCaregiver = require('../../auth/models/ProfessionalCaregiver.model');
      caregiver = await ProfessionalCaregiver.findOne({ accountId: caregiverAccountId });
    }
    if (!caregiver) {
      const Doctor = require('../../auth/models/Doctor.model');
      caregiver = await Doctor.findOne({ accountId: caregiverAccountId });
    }
    if (!caregiver) {
      const Pharmacist = require('../../auth/models/Pharmacist.model');
      caregiver = await Pharmacist.findOne({ accountId: caregiverAccountId });
    }
    if (!caregiver) {
      throw new AppError('Caregiver profile not found', 404, 'CAREGIVER_NOT_FOUND');
    }

    const relationship = await Relationship.findOne({ _id: relationshipId, caregiverId: caregiver._id, deletedAt: null });
    if (!relationship) {
      throw new AppError('Relationship not found', 404, 'RELATIONSHIP_NOT_FOUND');
    }

    // Validate state transition machine
    const allowed = ALLOWED_STATUS_TRANSITIONS[relationship.status];
    if (!allowed || !allowed.includes(status)) {
      throw new AppError(`Invalid status transition from ${relationship.status} to ${status}`, 400, 'INVALID_TRANSITION');
    }

    relationship.status = status;
    await relationship.save();
    return relationship;
  }

  /**
   * Revokes the relationship (Patient revokes connection). Supporting soft-delete.
   */
  async revokeRelationship(patientAccountId, relationshipId) {
    const patient = await Patient.findOne({ accountId: patientAccountId });
    if (!patient) {
      throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND');
    }

    const relationship = await Relationship.findOne({ _id: relationshipId, patientId: patient._id, deletedAt: null });
    if (!relationship) {
      throw new AppError('Relationship not found', 404, 'RELATIONSHIP_NOT_FOUND');
    }

    const allowed = ALLOWED_STATUS_TRANSITIONS[relationship.status];
    if (!allowed || !allowed.includes('REVOKED')) {
      throw new AppError(`Cannot revoke relationship from status: ${relationship.status}`, 400, 'INVALID_TRANSITION');
    }

    relationship.status = 'REVOKED';
    relationship.deletedAt = new Date(); // Soft delete connection
    await relationship.save();
    return relationship;
  }

  /**
   * Helper to check access permissions in other modules.
   */
  async checkCaregiverAccess(patientId, caregiverAccountId, requiredPermission) {
    let caregiver = await Caregiver.findOne({ accountId: caregiverAccountId });
    if (!caregiver) {
      const ProfessionalCaregiver = require('../../auth/models/ProfessionalCaregiver.model');
      caregiver = await ProfessionalCaregiver.findOne({ accountId: caregiverAccountId });
    }
    if (!caregiver) {
      const Doctor = require('../../auth/models/Doctor.model');
      caregiver = await Doctor.findOne({ accountId: caregiverAccountId });
    }
    if (!caregiver) {
      const Pharmacist = require('../../auth/models/Pharmacist.model');
      caregiver = await Pharmacist.findOne({ accountId: caregiverAccountId });
    }
    if (!caregiver) return false;

    const relationship = await Relationship.findOne({
      patientId,
      caregiverId: caregiver._id,
      status: 'ACCEPTED',
      deletedAt: null
    });

    if (!relationship) return false;
    return !!relationship.permissions[requiredPermission];
  }
}

module.exports = new RelationshipsService();
