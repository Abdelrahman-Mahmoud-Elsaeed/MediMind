const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentSchema = new Schema(
  {
    // The non-admin account authorizing the payment
    payerAccountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    payerRole: {
      type: String,
      enum: [
        "PATIENT",
        "FAMILY_CAREGIVER",
        "PROFESSIONAL_CAREGIVER",
        "DOCTOR",
        "PHARMACIST",
      ],
      required: true,
    },

    amount: { type: Number, required: true },
    currency: { type: String, default: "EGP" },

    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["CARD", "MOBILE_WALLET", "CASH_ON_DELIVERY", "KIOSK", "FAWRY"],
      required: true,
    },

    paymentType: {
      type: String,
      enum: [
        "SUBSCRIPTION_UPGRADE",
        "REFILL_ORDER_PAYMENT",
        "PROFESSIONAL_CAREGIVER_HIRE",
      ],
      required: true,
      index: true,
    },

    // --- Fix #5: Polymorphic reference with refPath for type-safe population ---
    referenceId: { type: Schema.Types.ObjectId, refPath: "referenceModel" },
    referenceModel: {
      type: String,
      enum: ["RefillOrder", "Doctor", "Pharmacist", "ProfessionalCaregiver"],
      required: true,
    },

    gatewayTransactionId: { type: String, unique: true, sparse: true },
    gatewayRawResponse: { type: Schema.Types.Map, of: Schema.Types.Mixed },
  },
  { timestamps: true },
);

PaymentSchema.index({ payerAccountId: 1, status: 1 });

module.exports = mongoose.model("Payment", PaymentSchema);
