const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },
    type: {
      type: String,
      enum: [
        'RELATIONSHIP_REQUEST',
        'RELATIONSHIP_ACCEPTED',
        'RELATIONSHIP_REJECTED',
        'MEDICATION_REFILL',
        'DOSE_MISSED',
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
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Indexes for common queries (listing user notifications by recency & unread count)
NotificationSchema.index({ recipientId: 1, isRead: 1 });
NotificationSchema.index({ recipientId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
