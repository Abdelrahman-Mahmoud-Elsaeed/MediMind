const crypto = require('crypto');
const QRCode = require('qrcode');
const Relationship = require('../models/Relationship.model');
const Patient = require('../../auth/models/Patient.model');
const Caregiver = require('../../auth/models/Caregiver.model');
const { logger } = require('../../../sheared/utils/logger');
const { FRONTEND_URL } = require('../../../config/env');

/**
 * Relationship Service — وفاء (Wafa)
 *
 * Handles:
 *  - Invitation creation (with QR code generation)
 *  - Invitation acceptance
 *  - Relationship revocation
 *  - Listing patient's caregivers and vice versa
 */
class RelationshipService {

  /**
   * Create an invitation for a caregiver
   * @param {String} patientAccountId - Patient's account ID (the inviter)
   * @param {Object} options - { invitedPhone?, permissions?, relationType? }
   * @returns {Object} { relationship, qrCodeDataUrl, invitationUrl }
   */
  async createInvitation(patientAccountId, options = {}) {
    // Get patient profile
    const patient = await Patient.findOne({ accountId: patientAccountId });
    if (!patient) throw new Error('Patient profile not found');

    // Check if there's an existing pending invitation with same phone (if provided)
    if (options.invitedPhone) {
      const existing = await Relationship.findOne({
        patientId: patient._id,
        invitedPhone: options.invitedPhone,
        status: 'PENDING',
        expiresAt: { $gt: new Date() }
      });
      if (existing) {
        // Reuse existing invitation
        const invitationUrl = `${FRONTEND_URL}/accept-invite/${existing.invitationToken}`;
        const qrCodeDataUrl = await QRCode.toDataURL(invitationUrl, {
          width: 400,
          margin: 2,
          color: { dark: '#0369A1', light: '#FFFFFF' }
        });
        return {
          relationship: existing,
          qrCodeDataUrl,
          invitationUrl
        };
      }
    }

    // Generate unique invitation token
    const invitationToken = crypto.randomBytes(24).toString('hex');

    // Set expiration (7 days)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Create relationship record
    const relationship = new Relationship({
      patientId: patient._id,
      invitationToken,
      invitedPhone: options.invitedPhone || null,
      invitedByName: `${patient.firstName} ${patient.lastName}`,
      invitedByRole: 'PATIENT',
      status: 'PENDING',
      permissions: options.permissions || {
        canAddMedication: true,
        canViewMedicalRecords: true,
        canConfirmDoses: true,
        canReceiveAlerts: true
      },
      relationType: options.relationType || null,
      expiresAt
    });
    await relationship.save();

    // Generate QR code
    const invitationUrl = `${FRONTEND_URL}/accept-invite/${invitationToken}`;
    const qrCodeDataUrl = await QRCode.toDataURL(invitationUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#0369A1', light: '#FFFFFF' }
    });

    logger.info(`Invitation created for patient ${patient._id}, token: ${invitationToken.substring(0, 8)}...`);

    return {
      relationship,
      qrCodeDataUrl,
      invitationUrl
    };
  }

  /**
   * Get invitation details by token (for the accept-invite page)
   */
  async getInvitationByToken(token) {
    const relationship = await Relationship.findOne({
      invitationToken: token,
      status: 'PENDING'
    }).populate('patientId', 'firstName lastName phone');

    if (!relationship) {
      throw new Error('Invitation not found or already used');
    }

    if (relationship.isInvitationExpired()) {
      throw new Error('Invitation has expired');
    }

    return {
      invitationToken: relationship.invitationToken,
      invitedByName: relationship.invitedByName,
      patientName: relationship.patientId
        ? `${relationship.patientId.firstName} ${relationship.patientId.lastName}`
        : relationship.invitedByName,
      permissions: relationship.permissions,
      relationType: relationship.relationType,
      expiresAt: relationship.expiresAt,
      invitedPhone: relationship.invitedPhone
    };
  }

  /**
   * Accept an invitation
   * @param {String} token - Invitation token
   * @param {String} caregiverAccountId - The accepting caregiver's account ID
   */
  async acceptInvitation(token, caregiverAccountId) {
    const relationship = await Relationship.findOne({
      invitationToken: token,
      status: 'PENDING'
    });

    if (!relationship) {
      throw new Error('Invitation not found or already used');
    }

    if (relationship.isInvitationExpired()) {
      throw new Error('Invitation has expired');
    }

    // Get caregiver profile
    const caregiver = await Caregiver.findOne({ accountId: caregiverAccountId });
    if (!caregiver) throw new Error('Caregiver profile not found');

    // Update relationship
    relationship.caregiverId = caregiver._id;
    relationship.status = 'ACCEPTED';
    relationship.acceptedAt = new Date();
    await relationship.save();

    // Link caregiver to patient
    const patient = await Patient.findById(relationship.patientId);
    if (patient) {
      if (!patient.caregiverIds.includes(caregiver._id)) {
        patient.caregiverIds.push(caregiver._id);
        await patient.save();
      }
    }

    // Link patient to caregiver
    if (!caregiver.patientIds.includes(relationship.patientId)) {
      caregiver.patientIds.push(relationship.patientId);
      await caregiver.save();
    }

    logger.info(`Invitation accepted: caregiver ${caregiver._id} → patient ${relationship.patientId}`);

    return {
      relationship,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'
    };
  }

  /**
   * Revoke a relationship (patient removes caregiver, or vice versa)
   */
  async revoke(relationshipId, revokedByAccountId) {
    const relationship = await Relationship.findById(relationshipId);
    if (!relationship) throw new Error('Relationship not found');

    relationship.status = 'REVOKED';
    relationship.revokedAt = new Date();
    relationship.revokedBy = revokedByAccountId;
    await relationship.save();

    // Remove from patient's caregiverIds
    await Patient.updateOne(
      { _id: relationship.patientId },
      { $pull: { caregiverIds: relationship.caregiverId } }
    );

    // Remove from caregiver's patientIds
    await Caregiver.updateOne(
      { _id: relationship.caregiverId },
      { $pull: { patientIds: relationship.patientId } }
    );

    logger.info(`Relationship revoked: ${relationshipId}`);
    return { success: true };
  }

  /**
   * Get all relationships for the current user
   * For PATIENT: returns their caregivers
   * For CAREGIVER: returns their patients
   */
  async getMyRelationships(accountId, role) {
    let relationships = [];

    if (role === 'PATIENT') {
      const patient = await Patient.findOne({ accountId });
      if (!patient) return [];

      relationships = await Relationship.find({
        patientId: patient._id,
        status: { $in: ['PENDING', 'ACCEPTED'] }
      })
        .populate('caregiverId', 'firstName lastName phone')
        .sort({ status: 1, createdAt: -1 });

      return relationships.map(r => ({
        _id: r._id,
        status: r.status,
        permissions: r.permissions,
        relationType: r.relationType,
        createdAt: r.createdAt,
        acceptedAt: r.acceptedAt,
        expiresAt: r.expiresAt,
        invitationToken: r.invitationToken,
        caregiver: r.caregiverId ? {
          name: `${r.caregiverId.firstName} ${r.caregiverId.lastName}`,
          phone: r.caregiverId.phone
        } : null,
        invitedPhone: r.invitedPhone
      }));

    } else if (role === 'CAREGIVER') {
      const caregiver = await Caregiver.findOne({ accountId });
      if (!caregiver) return [];

      relationships = await Relationship.find({
        caregiverId: caregiver._id,
        status: 'ACCEPTED'
      })
        .populate('patientId', 'firstName lastName phone dateOfBirth')
        .sort({ acceptedAt: -1 });

      return relationships.map(r => ({
        _id: r._id,
        status: r.status,
        permissions: r.permissions,
        relationType: r.relationType,
        acceptedAt: r.acceptedAt,
        patient: r.patientId ? {
          _id: r.patientId._id,
          name: `${r.patientId.firstName} ${r.patientId.lastName}`,
          phone: r.patientId.phone,
          age: r.patientId.dateOfBirth
            ? Math.floor((Date.now() - r.patientId.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
            : null
        } : null
      }));
    }

    return [];
  }
}

module.exports = new RelationshipService();
