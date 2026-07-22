// src/modules/consent/services/consent.service.js
const Patient = require('../../auth/models/Patient.model');
const Account = require('../../auth/models/Account.model');
const ConsentAudit = require('../models/ConsentAudit.model');
const AppError = require('../../../shared/utils/AppError');
const { logger } = require('../../../shared/utils/logger');
const ServiceResponse = require('../../../shared/utils/ServiceResponse');

const VALID_CONSENT_TYPES = ['familyCaregiver', 'professionalCaregiver', 'doctor', 'pharmacy'];

class ConsentService {
  async updateConsent(userAccountId, consents, reason = null, reqMetadata = {}) {
    const patient = await Patient.findOne({ accountId: userAccountId });
    if (!patient) throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND', { en: 'Patient not found.', ar: 'المريض غير موجود.' });

    if (!patient.consents) {
      patient.consents = { familyCaregiver: false, professionalCaregiver: false, doctor: false, pharmacy: false };
    }

    const auditRecords = [];
    const changes = [];

    for (const consentType of VALID_CONSENT_TYPES) {
      const newValue = consents[consentType];
      if (newValue === undefined) continue;
      const previousValue = patient.consents[consentType] || false;
      if (newValue !== previousValue) {
        changes.push({ consentType, previousValue, newValue, action: newValue ? 'GRANTED' : 'REVOKED' });
        auditRecords.push({
          patientId: patient._id, accountId: userAccountId, consentType, previousValue, newValue,
          action: newValue ? 'GRANTED' : 'REVOKED', reason,
          ipAddress: reqMetadata.ipAddress || null, userAgent: reqMetadata.userAgent || null, deviceId: reqMetadata.deviceId || null,
        });
        patient.consents[consentType] = newValue;
      }
    }

    if (changes.length === 0) {
      return new ServiceResponse({
        status: 'SUCCESS', en: 'No changes.', ar: 'لا توجد تغييرات.',
        data: { consents: patient.consents, changesCount: 0 },
      });
    }

    await patient.save();
    if (auditRecords.length > 0) await ConsentAudit.insertMany(auditRecords);

    logger.info(`[ConsentUpdate] Patient ${patient._id} updated ${changes.length} consent(s)`);
    return new ServiceResponse({
      status: 'SUCCESS', en: 'Consent updated.', ar: 'تم تحديث الموافقة.',
      data: { patientId: patient._id, consents: patient.consents, changesCount: changes.length, changes },
    });
  }

  async getConsentAudit(userAccountId, options = {}) {
    const { limit = 50, consentType } = options;
    const patient = await Patient.findOne({ accountId: userAccountId }).lean();
    if (!patient) throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND', { en: 'Patient not found.', ar: 'المريض غير موجود.' });

    const query = { patientId: patient._id };
    if (consentType && VALID_CONSENT_TYPES.includes(consentType)) query.consentType = consentType;

    const auditRecords = await ConsentAudit.find(query).sort({ createdAt: -1 }).limit(Math.min(parseInt(limit, 10) || 50, 200)).lean();
    const currentConsents = patient.consents || { familyCaregiver: false, professionalCaregiver: false, doctor: false, pharmacy: false };

    return new ServiceResponse({
      status: 'SUCCESS', en: 'Audit trail retrieved.', ar: 'تم استرجاع السجل.',
      data: {
        patientId: patient._id, currentConsents,
        auditRecords: auditRecords.map((r) => ({
          auditId: r._id, consentType: r.consentType, previousValue: r.previousValue, newValue: r.newValue,
          action: r.action, reason: r.reason, ipAddress: r.ipAddress, userAgent: r.userAgent, deviceId: r.deviceId, timestamp: r.createdAt,
        })),
        totalCount: auditRecords.length,
      },
    });
  }
}
module.exports = new ConsentService();
