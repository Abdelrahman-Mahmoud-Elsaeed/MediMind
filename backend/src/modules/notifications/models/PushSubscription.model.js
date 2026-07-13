const mongoose = require('mongoose');

/**
 * Push Subscription Schema — وفاء (Wafa)
 *
 * Stores PWA web push subscriptions per account.
 * A user may have multiple subscriptions (multiple devices/browsers).
 */
const PushSubscriptionSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    index: true
  },

  // Web Push subscription object (from browser Push API)
  endpoint: {
    type: String,
    required: true,
    unique: true
  },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true }
  },

  // Device info for debugging
  userAgent: { type: String, default: null },
  deviceType: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop', 'unknown'],
    default: 'unknown'
  },

  isActive: { type: Boolean, default: true }
}, { timestamps: true });

PushSubscriptionSchema.index({ accountId: 1, isActive: 1 });

module.exports = mongoose.model('PushSubscription', PushSubscriptionSchema);
