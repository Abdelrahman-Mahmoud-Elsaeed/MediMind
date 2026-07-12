import { z } from "zod";

export const addMedicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  strength: z.string().min(1, "Dosage strength is required"),
  formType: z.enum(["CAPSULE", "TABLET", "SYRUP", "INJECTION", "DROP", "CREAM", "OTHER"]),
  frequency: z.enum(["DAILY", "WEEKLY", "AS_NEEDED"]),
  firstDoseTime: z.string().regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  relationToMeals: z.enum(["NONE", "BEFORE_MEALS", "AFTER_MEALS", "WITH_FOOD", "ON_EMPTY_STOMACH"]),
  initialQuantity: z.number().int().min(1, "Total doses stocked must be at least 1"),
  refillThreshold: z.number().int().min(0, "Refill threshold cannot be negative")
});

export const profileSchema = z.object({
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  dateOfBirth: z.string().datetime("Invalid date of birth format"),
  emergencyContact: z.object({
    name: z.string().min(1, "Emergency contact name is required"),
    phone: z.string().min(1, "Emergency contact phone is required")
  })
});

export const inviteCaregiverSchema = z.object({
  caregiverEmail: z.string().email("Please enter a valid email address"),
  permissions: z.object({
    canAddMedication: z.boolean(),
    canViewMedicalRecords: z.boolean()
  })
});

export const conditionSchema = z.object({
  diseaseName: z.string().min(1, "Condition name is required"),
  isChronic: z.boolean(),
  diagnosedDate: z.string().optional(),
  notes: z.string().optional()
});
