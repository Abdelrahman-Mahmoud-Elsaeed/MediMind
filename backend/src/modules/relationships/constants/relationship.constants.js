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
  REJECTED: [],
  REVOKED: ['PENDING']
};

const DEFAULT_PERMISSIONS_BY_MODEL = {
  FamilyCaregiver: {
    canAddMedication: true,
    canEditMedication: true,
    canDeleteMedication: true,
    canViewMedicalRecords: true,
    canEditMedicalRecords: false,
    canManageAppointments: true,
    canReceiveNotifications: true
  },
  Doctor: {
    canAddMedication: true,
    canEditMedication: true,
    canDeleteMedication: true,
    canViewMedicalRecords: true,
    canEditMedicalRecords: true,
    canManageAppointments: true,
    canReceiveNotifications: true
  },
  Pharmacist: {
    canAddMedication: false,
    canEditMedication: false,
    canDeleteMedication: false,
    canViewMedicalRecords: false,
    canEditMedicalRecords: false,
    canManageAppointments: false,
    canReceiveNotifications: true
  },
  ProfessionalCaregiver: {
    canAddMedication: true,
    canEditMedication: false,
    canDeleteMedication: false,
    canViewMedicalRecords: true,
    canEditMedicalRecords: false,
    canManageAppointments: true,
    canReceiveNotifications: true
  }
};

module.exports = {
  CAREGIVER_MODELS,
  RELATIONS,
  STATUSES,
  ALLOWED_STATUS_TRANSITIONS,
  DEFAULT_PERMISSIONS_BY_MODEL
};
