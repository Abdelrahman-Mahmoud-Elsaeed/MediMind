const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    recipientAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    recipientRole: {
      type: String,
      enum: [
        'PATIENT',
        'FAMILY_CAREGIVER',
        'PROFESSIONAL_CAREGIVER',
        'DOCTOR',
        'PHARMACIST',
        'ADMIN',
      ],
      required: true,
    },
    type: {
      type: String,
      enum: [
        'REFILL_ORDER_CREATED',
        'REFILL_ORDER_UPDATED',
        'DOSE_REMINDER',
        'MEDICATION_LOW_STOCK',
        'CAREGIVER_INVITATION',
        'GENERAL',
      ],
      default: 'GENERAL',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ recipientAccountId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
