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
  async initiateRelationship(userAccountId, userRole, targetEmail, relation, permissions) {
    let patient;
    let caregiver;
    let caregiverType;

    if (userRole === 'PATIENT') {
      patient = await Patient.findOne({ accountId: userAccountId });
      if (!patient) {
        throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND');
      }

      const targetAccount = await Account.findOne({ email: targetEmail });
      if (!targetAccount) {
        throw new AppError('Account not found for provided email', 404, 'ACCOUNT_NOT_FOUND');
      }

      if (targetAccount._id.toString() === userAccountId.toString()) {
        throw new AppError('Cannot send a connection request to yourself', 400, 'SELF_RELATIONSHIP_NOT_ALLOWED');
      }

      if (targetAccount.role === 'CAREGIVER' || targetAccount.role === 'FAMILY_CAREGIVER') {
        caregiver = await Caregiver.findOne({ accountId: targetAccount._id });
        caregiverType = 'FamilyCaregiver';
      } else if (targetAccount.role === 'PROFESSIONAL_CAREGIVER') {
        const ProfessionalCaregiver = require('../../auth/models/ProfessionalCaregiver.model');
        caregiver = await ProfessionalCaregiver.findOne({ accountId: targetAccount._id });
        caregiverType = 'ProfessionalCaregiver';
      } else if (targetAccount.role === 'DOCTOR') {
        const Doctor = require('../../auth/models/Doctor.model');
        caregiver = await Doctor.findOne({ accountId: targetAccount._id });
        caregiverType = 'Doctor';
      }

      if (!caregiver) {
        throw new AppError('Caregiver profile not found for target account', 404, 'CAREGIVER_NOT_FOUND');
      }
    } else if (['CAREGIVER', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'DOCTOR'].includes(userRole)) {
      if (userRole === 'CAREGIVER' || userRole === 'FAMILY_CAREGIVER') {
        caregiver = await Caregiver.findOne({ accountId: userAccountId });
        caregiverType = 'FamilyCaregiver';
      } else if (userRole === 'PROFESSIONAL_CAREGIVER') {
        const ProfessionalCaregiver = require('../../auth/models/ProfessionalCaregiver.model');
        caregiver = await ProfessionalCaregiver.findOne({ accountId: userAccountId });
        caregiverType = 'ProfessionalCaregiver';
      } else if (userRole === 'DOCTOR') {
        const Doctor = require('../../auth/models/Doctor.model');
        caregiver = await Doctor.findOne({ accountId: userAccountId });
        caregiverType = 'Doctor';
      }

      if (!caregiver) {
        throw new AppError('Caregiver profile not found', 404, 'CAREGIVER_NOT_FOUND');
      }

      const targetAccount = await Account.findOne({ email: targetEmail });
      if (!targetAccount) {
        throw new AppError('Patient account not found for provided email', 404, 'ACCOUNT_NOT_FOUND');
      }

      if (targetAccount._id.toString() === userAccountId.toString()) {
        throw new AppError('Cannot send a connection request to yourself', 400, 'SELF_RELATIONSHIP_NOT_ALLOWED');
      }

      patient = await Patient.findOne({ accountId: targetAccount._id });
      if (!patient) {
        throw new AppError('Patient profile not found for target account', 404, 'PATIENT_NOT_FOUND');
      }
    } else {
      throw new AppError('Invalid role for initiating relationship', 403, 'FORBIDDEN');
    }

    // Check if relationship already exists
    const existing = await Relationship.findOne({
      patientId: patient._id,
      caregiverId: caregiver._id,
      caregiverType,
      deletedAt: null
    });

    const initiatedByRole = userRole === 'PATIENT' ? 'PATIENT' : 'CAREGIVER';

    if (existing) {
      if (existing.status === 'PENDING') {
        throw new AppError('A connection request is already pending between this patient and caregiver', 400, 'PENDING_REQUEST_EXISTS');
      }
      if (existing.status === 'ACCEPTED') {
        throw new AppError('An active relationship already exists between this patient and caregiver', 400, 'RELATIONSHIP_EXISTS');
      }

      const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[existing.status];
      if (allowedTransitions && allowedTransitions.includes('PENDING')) {
        existing.status = 'PENDING';
        existing.relation = relation || existing.relation || (userRole === 'PATIENT' ? 'Family Member' : 'Patient');
        existing.initiatedBy = initiatedByRole;
        existing.permissions = permissions || DEFAULT_PERMISSIONS_BY_MODEL[caregiverType];
        existing.deletedAt = null;
        await existing.save();
        return existing;
      }
      throw new AppError(`Cannot re-initiate relationship from state: ${existing.status}`, 400, 'INVALID_TRANSITION');
    }

    const relationship = new Relationship({
      patientId: patient._id,
      caregiverId: caregiver._id,
      caregiverType,
      relation: relation || (userRole === 'PATIENT' ? 'Family Member' : 'Patient'),
      status: 'PENDING',
      initiatedBy: initiatedByRole,
      permissions: permissions || DEFAULT_PERMISSIONS_BY_MODEL[caregiverType]
    });

    await relationship.save();
    return relationship;
  }

  /**
   * Lists all active or pending relationships filtered by role and status.
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
      .populate({
        path: 'patientId',
        select: 'firstName lastName phone accountId',
        populate: { path: 'accountId', select: 'email role' }
      })
      .populate({
        path: 'caregiverId',
        select: 'firstName lastName phone accountId',
        populate: { path: 'accountId', select: 'email role' }
      });

    return list.map(item => {
      const patientObj = item.patientId ? {
        _id: item.patientId._id,
        id: item.patientId._id,
        firstName: item.patientId.firstName,
        lastName: item.patientId.lastName,
        phone: item.patientId.phone,
        email: item.patientId.accountId?.email || ''
      } : null;

      const caregiverObj = item.caregiverId ? {
        _id: item.caregiverId._id,
        id: item.caregiverId._id,
        firstName: item.caregiverId.firstName,
        lastName: item.caregiverId.lastName,
        phone: item.caregiverId.phone,
        email: item.caregiverId.accountId?.email || ''
      } : null;

      return {
        relationshipId: item._id,
        id: item._id,
        patientId: patientObj,
        caregiverId: caregiverObj,
        caregiverType: item.caregiverType,
        relation: item.relation,
        status: item.status,
        permissions: item.permissions,
        initiatedBy: item.initiatedBy || 'PATIENT',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };
    });
  }

  /**
   * Updates status of an invitation (Recipient accepting/rejecting request).
   */
  async updateStatus(userAccountId, userRole, relationshipId, status) {
    let relationship;

    if (userRole === 'PATIENT') {
      const patient = await Patient.findOne({ accountId: userAccountId });
      if (!patient) {
        throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND');
      }
      relationship = await Relationship.findOne({ _id: relationshipId, patientId: patient._id, deletedAt: null });
    } else {
      let caregiver = await Caregiver.findOne({ accountId: userAccountId });
      if (!caregiver) {
        const ProfessionalCaregiver = require('../../auth/models/ProfessionalCaregiver.model');
        caregiver = await ProfessionalCaregiver.findOne({ accountId: userAccountId });
      }
      if (!caregiver) {
        const Doctor = require('../../auth/models/Doctor.model');
        caregiver = await Doctor.findOne({ accountId: userAccountId });
      }
      if (!caregiver) {
        const Pharmacist = require('../../auth/models/Pharmacist.model');
        caregiver = await Pharmacist.findOne({ accountId: userAccountId });
      }
      if (!caregiver) {
        throw new AppError('Caregiver profile not found', 404, 'CAREGIVER_NOT_FOUND');
      }
      relationship = await Relationship.findOne({ _id: relationshipId, caregiverId: caregiver._id, deletedAt: null });
    }

    if (!relationship) {
      throw new AppError('Relationship not found', 404, 'RELATIONSHIP_NOT_FOUND');
    }

    // Verify recipient permissions: only the recipient of the request can Accept or Reject
    if (['ACCEPTED', 'REJECTED'].includes(status) && relationship.status === 'PENDING') {
      if (relationship.initiatedBy === 'PATIENT' && userRole === 'PATIENT') {
        throw new AppError('Only the recipient caregiver can accept or reject this request', 403, 'FORBIDDEN');
      }
      if (relationship.initiatedBy === 'CAREGIVER' && userRole !== 'PATIENT') {
        throw new AppError('Only the recipient patient can accept or reject this request', 403, 'FORBIDDEN');
      }
    }

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
   * Reads the permission key directly from the Relationship document.
   * Returns false if no active relationship exists or the permission is not granted.
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

    // Read the permission key directly — all 10 keys are now explicit in the schema.
    // If the key is missing for any reason, default to denied (false).
    const value = relationship.permissions?.[requiredPermission];
    return value === true;
  }
}

module.exports = new RelationshipsService();
