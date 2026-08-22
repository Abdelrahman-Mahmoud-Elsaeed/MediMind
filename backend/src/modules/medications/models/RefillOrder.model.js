const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RefillOrderSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    medicationId: {
      type: Schema.Types.ObjectId,
      ref: "Medication",
      required: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    }, // Patient, Caregiver, or Doctor account

    targetPharmacyId: {
      type: Schema.Types.ObjectId,
      ref: "Pharmacist",
      required: true,
      index: true,
    },

    orderStatus: {
      type: String,
      enum: [
        "SUBMITTED",
        "APPROVED",
        "DISPENSED",
        "READY_FOR_PICKUP",
        "COMPLETED",
        "REJECTED",
      ],
      default: "SUBMITTED",
      index: true,
    },

    fulfillmentType: {
      type: String,
      enum: ["PICKUP", "DELIVERY"],
      required: true,
    },
    deliveryAddress: {
      street: String,
      city: String,
      zipCode: String,
    },

    quantityRequested: { type: Number, required: true },
    pharmacistNotes: { type: String },
    dispensedAt: { type: Date },

    // Payment details
    paymentMethod: {
      type: String,
      enum: ["CARD", "CASH_ON_DELIVERY", "STRIPE", "FAWRY", "MOBILE_WALLET"],
      default: "CASH_ON_DELIVERY",
    },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PENDING", "PAID", "REFUNDED"],
      default: "UNPAID",
    },
    totalAmount: { type: Number, default: 0 },

    // Financial reference
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment", default: null },
  },
  { timestamps: true },
);

RefillOrderSchema.index({ orderStatus: 1, targetPharmacyId: 1 });

module.exports = mongoose.model("RefillOrder", RefillOrderSchema);
