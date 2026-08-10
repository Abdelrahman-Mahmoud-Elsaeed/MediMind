/**
 * Canonical fine-grained permission keys for caregiver relationships.
 * These match the Relationship.permissions schema on the backend exactly.
 *
 * Usage:
 *   import { PERMISSIONS } from '@/shared/constants/permissions';
 *   const canEdit = relationship.permissions?.[PERMISSIONS.canEditMedication];
 */
export const PERMISSIONS = {
  // Medication access
  canViewMedications:      'canViewMedications',
  canAddMedication:        'canAddMedication',
  canEditMedication:       'canEditMedication',
  canDeleteMedication:     'canDeleteMedication',
  // Medical records (conditions / history)
  canViewMedicalRecords:   'canViewMedicalRecords',
  canEditMedicalRecords:   'canEditMedicalRecords',
  // Dose tracking
  canViewDoseSchedule:     'canViewDoseSchedule',
  canConfirmDose:          'canConfirmDose',
  // Pharmacy / refills
  canOrderRefills:         'canOrderRefills',
  // Notifications
  canReceiveNotifications: 'canReceiveNotifications',
};

/**
 * Default permission preset for a FamilyCaregiver relationship.
 * Mirrors DEFAULT_PERMISSIONS_BY_MODEL.FamilyCaregiver on the backend.
 */
export const DEFAULT_FAMILY_CAREGIVER_PERMISSIONS = {
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
};

/**
 * Default permission preset for a ProfessionalCaregiver relationship.
 */
export const DEFAULT_PROFESSIONAL_CAREGIVER_PERMISSIONS = {
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
};

/**
 * Default permission preset for a Doctor relationship.
 */
export const DEFAULT_DOCTOR_PERMISSIONS = {
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
};
