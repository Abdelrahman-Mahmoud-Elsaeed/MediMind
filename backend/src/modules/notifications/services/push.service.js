const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription.model');
const NotificationLog = require('../models/NotificationLog.model');
const { logger } = require('../../../sheared/utils/logger');
const { VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = require('../../../config/env');

/**
 * Push Service — وفاء (Wafa)
 *
 * Sends web push notifications to PWA subscribers via FCM/VAPID.
 * Handles multiple subscriptions per account (multiple devices).
 */
class PushService {
  constructor() {
    this.configured = false;
    // Configure web-push with VAPID keys (only if both keys are present and valid)
    try {
      if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY &&
          VAPID_PUBLIC_KEY.length > 30 && VAPID_PRIVATE_KEY.length > 30) {
        webpush.setVapidDetails(
          VAPID_SUBJECT || 'mailto:admin@wafa.app',
          VAPID_PUBLIC_KEY,
          VAPID_PRIVATE_KEY
        );
        this.configured = true;
        logger.info('✅ Push notifications configured with VAPID keys');
      } else {
        logger.warn('⚠️ VAPID keys not configured — push notifications will be stubbed (dev mode)');
      }
    } catch (err) {
      logger.warn('⚠️ Invalid VAPID keys — push notifications will be stubbed:', err.message);
      this.configured = false;
    }
  }

  /**
   * Get the public VAPID key (for frontend subscription)
   */
  getPublicKey() {
    return VAPID_PUBLIC_KEY;
  }

  /**
   * Save a push subscription for an account
   * @param {String} accountId - Account ID
   * @param {Object} subscription - Web Push subscription object
   * @param {Object} deviceInfo - { userAgent, deviceType }
   */
  async subscribe(accountId, subscription, deviceInfo = {}) {
    const existing = await PushSubscription.findOne({ endpoint: subscription.endpoint });

    if (existing) {
      // Update existing
      existing.accountId = accountId;
      existing.keys = subscription.keys;
      existing.userAgent = deviceInfo.userAgent || existing.userAgent;
      existing.deviceType = deviceInfo.deviceType || existing.deviceType;
      existing.isActive = true;
      await existing.save();
      return existing;
    }

    const newSub = new PushSubscription({
      accountId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent: deviceInfo.userAgent,
      deviceType: deviceInfo.deviceType || 'unknown'
    });
    await newSub.save();
    logger.info(`Push subscription saved for account ${accountId}`);
    return newSub;
  }

  /**
   * Remove a push subscription
   */
  async unsubscribe(accountId, endpoint) {
    const result = await PushSubscription.deleteOne({ accountId, endpoint });
    return result.deletedCount > 0;
  }

  /**
   * Send a push notification to all devices for an account
   * @param {String} accountId - Account ID
   * @param {Object} payload - { title, body, data?, tag? }
   * @param {Object} logData - For NotificationLog
   * @returns {Object} { success, sentCount, failedCount }
   */
  async send(accountId, payload, logData = {}) {
    const subscriptions = await PushSubscription.find({
      accountId,
      isActive: true
    });

    if (subscriptions.length === 0) {
      logger.warn(`No push subscriptions for account ${accountId}`);
      return { success: false, sentCount: 0, failedCount: 0, reason: 'NO_SUBSCRIPTIONS' };
    }

    // Create notification log entry
    const log = new NotificationLog({
      accountId,
      patientId: logData.patientId || null,
      doseEventId: logData.doseEventId || null,
      medicationId: logData.medicationId || null,
      channel: 'PUSH',
      type: logData.type || 'CUSTOM',
      title: payload.title,
      body: payload.body,
      status: 'PENDING',
      batchGroup: logData.batchGroup || null,
      escalationStep: logData.escalationStep || null
    });

    let sentCount = 0;
    let failedCount = 0;

    if (!this.configured) {
      // Dev mode — stub
      logger.info(`[DEV PUSH] To: ${accountId}\nTitle: ${payload.title}\nBody: ${payload.body}`);
      log.status = 'SENT';
      log.sentAt = new Date();
      await log.save();
      return { success: true, sentCount: 1, failedCount: 0, logId: log._id };
    }

    const message = JSON.stringify({
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      tag: payload.tag || 'wafa-notification',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      vibrate: [100, 50, 100],
      requireInteraction: payload.requireInteraction || false,
      actions: payload.actions || []
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: sub.keys
        }, message);
        sentCount++;
      } catch (error) {
        failedCount++;
        logger.error(`Push failed for subscription ${sub._id}:`, error.statusCode || error.message);

        // If subscription is no longer valid (410 Gone), deactivate it
        if (error.statusCode === 410 || error.statusCode === 404) {
          sub.isActive = false;
          await sub.save();
        }
      }
    }

    log.status = sentCount > 0 ? 'SENT' : 'FAILED';
    log.sentAt = new Date();
    if (sentCount === 0) log.errorMessage = 'All push attempts failed';
    await log.save();

    return {
      success: sentCount > 0,
      sentCount,
      failedCount,
      logId: log._id
    };
  }
}

module.exports = new PushService();
