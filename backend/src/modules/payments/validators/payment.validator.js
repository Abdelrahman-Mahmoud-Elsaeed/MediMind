const { z } = require('zod');

const createPaymentSchema = z.object({
  payerRole: z.enum([
    "PATIENT",
    "FAMILY_CAREGIVER",
    "PROFESSIONAL_CAREGIVER",
    "DOCTOR",
    "PHARMACIST"
  ]).optional(),
  amount: z.number().positive('Amount must be greater than 0'),
  currency: z.string().default("EGP"),
  paymentMethod: z.enum(["CARD", "MOBILE_WALLET", "CASH_ON_DELIVERY", "KIOSK", "FAWRY", "STRIPE"]).default("STRIPE"),
  paymentType: z.enum([
    "SUBSCRIPTION_UPGRADE",
    "REFILL_ORDER_PAYMENT",
    "PROFESSIONAL_CAREGIVER_HIRE"
  ]).default("REFILL_ORDER_PAYMENT"),
  referenceId: z.string().min(1, 'referenceId is required'),
  referenceModel: z.enum(["RefillOrder", "Doctor", "Pharmacist", "ProfessionalCaregiver"]).default("RefillOrder"),
  gatewayTransactionId: z.string().optional()
});

const createCheckoutSessionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('egp'),
  productName: z.string().optional(),
  paymentType: z.enum([
    "SUBSCRIPTION_UPGRADE",
    "REFILL_ORDER_PAYMENT",
    "PROFESSIONAL_CAREGIVER_HIRE"
  ]).default("REFILL_ORDER_PAYMENT"),
  referenceId: z.string().min(1, 'referenceId is required'),
  referenceModel: z.enum(["RefillOrder", "Doctor", "Pharmacist", "ProfessionalCaregiver"]).default("RefillOrder"),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
});

const createPaymentIntentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('egp'),
  paymentType: z.enum([
    "SUBSCRIPTION_UPGRADE",
    "REFILL_ORDER_PAYMENT",
    "PROFESSIONAL_CAREGIVER_HIRE"
  ]).default("REFILL_ORDER_PAYMENT"),
  referenceId: z.string().min(1, 'referenceId is required'),
  referenceModel: z.enum(["RefillOrder", "Doctor", "Pharmacist", "ProfessionalCaregiver"]).default("RefillOrder"),
});

module.exports = {
  createPaymentSchema,
  createCheckoutSessionSchema,
  createPaymentIntentSchema,
};
