const { z } = require('zod');

const createPaymentSchema = z.object({
  payerRole: z.enum([
    "PATIENT",
    "FAMILY_CAREGIVER",
    "PROFESSIONAL_CAREGIVER",
    "DOCTOR",
    "PHARMACIST"
  ]),
  amount: z.number().positive(),
  currency: z.string().default("EGP"),
  paymentMethod: z.enum(["CARD", "MOBILE_WALLET", "CASH_ON_DELIVERY", "KIOSK", "FAWRY"]),
  paymentType: z.enum([
    "SUBSCRIPTION_UPGRADE",
    "REFILL_ORDER_PAYMENT",
    "PROFESSIONAL_CAREGIVER_HIRE"
  ]),
  referenceId: z.string().min(1, 'referenceId is required'),
  referenceModel: z.enum(["RefillOrder", "Doctor", "Pharmacist", "ProfessionalCaregiver"]),
  gatewayTransactionId: z.string().optional()
});

module.exports = {
  createPaymentSchema
};
