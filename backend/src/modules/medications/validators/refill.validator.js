const { z } = require('zod');

const createRefillOrderSchema = z.object({
  medicationId: z.string().min(1, 'medicationId is required'),
  targetPharmacyId: z.string().min(1, 'targetPharmacyId is required'),
  quantityRequested: z.number().positive('Quantity must be greater than 0'),
  fulfillmentType: z.enum(['PICKUP', 'DELIVERY']),
  deliveryAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional()
  }).optional(),
  paymentMethod: z.enum(['CARD', 'CASH_ON_DELIVERY', 'STRIPE', 'FAWRY', 'MOBILE_WALLET']).optional(),
  paymentStatus: z.enum(['UNPAID', 'PENDING', 'PAID', 'REFUNDED']).optional(),
  totalAmount: z.number().optional()
});

const updateRefillStatusSchema = z.object({
  orderStatus: z.enum([
    'SUBMITTED',
    'APPROVED',
    'DISPENSED',
    'READY_FOR_PICKUP',
    'COMPLETED',
    'REJECTED'
  ]),
  pharmacistNotes: z.string().optional()
});

module.exports = {
  createRefillOrderSchema,
  updateRefillStatusSchema
};
