const CAREGIVER_MODELS = ['FamilyCaregiver', 'ProfessionalCaregiver', 'Doctor', 'Pharmacist'];

const RELATIONS = {
  FamilyCaregiver: ['son', 'daughter', 'spouse', 'parent', 'sibling', 'friend', 'other'],
  Doctor: ['doctor'],
  Pharmacist: ['pharmacist'],
  ProfessionalCaregiver: ['professional_caregiver']
};

const STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED', 'REVOKED'];

const ALLOWED_STATUS_TRANSITIONS = {
  PENDING: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['REVOKED'],
  REJECTED: ['PENDING'],
  REVOKED: ['PENDING']
};

/**
 * Default permission presets applied when a new Relationship is created.
 * All keys must match the Relationship.model.js permissions schema exactly.
 *
 * Pharmacist is intentionally omitted — Pharmacist accounts do not have
 * a patient Relationship document; they manage refill orders via their
 * own Pharmacist profile reference.
 */
const DEFAULT_PERMISSIONS_BY_MODEL = {
  FamilyCaregiver: {
    canViewMedications:      true,
    canAddMedication:        true,
    canEditMedication:       true,
    canDeleteMedication:     true,
    canViewMedicalRecords:   true,
    canEditMedicalRecords:   false,
    canViewDoseSchedule:     true,
    canConfirmDose:          true,
    canOrderRefills:         true,
    canReceiveNotifications: true,
  },
  Doctor: {
    canViewMedications:      true,
    canAddMedication:        true,
    canEditMedication:       true,
    canDeleteMedication:     true,
    canViewMedicalRecords:   true,
    canEditMedicalRecords:   true,
    canViewDoseSchedule:     true,
    canConfirmDose:          false,
    canOrderRefills:         true,
    canReceiveNotifications: true,
  },
  ProfessionalCaregiver: {
    canViewMedications:      true,
    canAddMedication:        true,
    canEditMedication:       false,
    canDeleteMedication:     false,
    canViewMedicalRecords:   true,
    canEditMedicalRecords:   false,
    canViewDoseSchedule:     true,
    canConfirmDose:          true,
    canOrderRefills:         false,
    canReceiveNotifications: true,
  },
};

module.exports = {
  CAREGIVER_MODELS,
  RELATIONS,
  STATUSES,
  ALLOWED_STATUS_TRANSITIONS,
  DEFAULT_PERMISSIONS_BY_MODEL
};
