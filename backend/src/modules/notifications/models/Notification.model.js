const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    recipientAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
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
      default: 'PATIENT',
    },
    type: {
      type: String,
      enum: [
        'RELATIONSHIP_REQUEST',
        'RELATIONSHIP_ACCEPTED',
        'RELATIONSHIP_REJECTED',
        'MEDICATION_REFILL',
        'DOSE_MISSED',
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
    titleAr: {
      type: String,
      default: null,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    messageAr: {
      type: String,
      default: null,
      trim: true,
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
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

NotificationSchema.pre('save', function (next) {
  if (this.recipientId && !this.recipientAccountId) {
    this.recipientAccountId = this.recipientId;
  } else if (this.recipientAccountId && !this.recipientId) {
    this.recipientId = this.recipientAccountId;
  }
  next();
});

NotificationSchema.index({ recipientId: 1, isRead: 1 });
NotificationSchema.index({ recipientId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
