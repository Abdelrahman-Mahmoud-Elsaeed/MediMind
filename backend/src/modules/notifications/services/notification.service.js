const Notification = require('../models/Notification.model');
const PushSubscription = require('../models/PushSubscription.model');
const { emitToUser, emitToPharmacy, emitToRole } = require('../../../config/socket');
const { webpush, isConfigured } = require('../../../config/webpush');
const { logger } = require('../../../shared/utils/logger');
const AppError = require('../../../shared/utils/AppError');

class NotificationService {
  /**
   * Persist a notification in MongoDB and dispatch real-time Socket.IO & Web Push alerts
   */
  async createAndSendNotification({
    recipientAccountId,
    recipientRole,
    type = 'GENERAL',
    title,
    message,
    data = {},
    targetPharmacyId = null,
  }) {
    try {
      const notification = new Notification({
        recipientAccountId,
        recipientRole,
        type,
        title,
        message,
        data,
      });

      await notification.save();

      // Real-time dispatch via Socket.IO
      const payload = {
        _id: notification._id,
        id: notification._id,
        recipientAccountId,
        recipientRole,
        type,
        title,
        message,
        data,
        isRead: false,
        createdAt: notification.createdAt,
      };

      // 1. Send generic 'notification' event to personal user room
      if (recipientAccountId) {
        emitToUser(recipientAccountId, 'notification', payload);
        // 1b. Dispatch PWA Web Push notification asynchronously
        this.sendWebPushNotification(recipientAccountId, {
          title,
          message,
          type,
          data,
          url: data.url || '/dashboard',
        }).catch((err) => logger.warn('[WebPush] Non-blocking push dispatch error: ' + err.message));
      }

      // 2. Specialized domain events for instant UI reactivity
      if (type === 'REFILL_ORDER_CREATED') {
        if (targetPharmacyId) {
          emitToPharmacy(targetPharmacyId, 'new_refill_order', payload);
        } else {
          emitToRole('PHARMACIST', 'new_refill_order', payload);
        }
      } else if (type === 'REFILL_ORDER_UPDATED') {
        if (recipientAccountId) {
          emitToUser(recipientAccountId, 'refill_status_updated', payload);
        }
      }

      logger.info(`Notification created & dispatched: [${type}] to user ${recipientAccountId}`);
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      // Non-blocking error handling so primary workflow doesn't fail
      return null;
    }
  }

  /**
   * Save or update a PWA Web Push subscription for an authenticated user
   */
  async savePushSubscription(accountId, { endpoint, keys, userAgent }) {
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      throw new AppError('Invalid push subscription payload', 400, 'INVALID_SUBSCRIPTION_PAYLOAD');
    }

    const subscription = await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        accountId,
        endpoint,
        keys,
        userAgent: userAgent || '',
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    return subscription;
  }

  /**
   * Remove a PWA Web Push subscription
   */
  async deletePushSubscription(accountId, endpoint) {
    await PushSubscription.deleteOne({ accountId, endpoint });
    return { success: true };
  }

  /**
   * Dispatch Web Push payload to all active browser devices registered to a user
   */
  async sendWebPushNotification(accountId, pushPayload) {
    if (!isConfigured()) {
      return { sent: 0, reason: 'VAPID keys not configured' };
    }

    const subscriptions = await PushSubscription.find({ accountId });
    if (!subscriptions || subscriptions.length === 0) {
      return { sent: 0, reason: 'No subscriptions found' };
    }

    const payloadString = JSON.stringify(pushPayload);
    let sentCount = 0;

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys,
            },
            payloadString
          );
          sentCount++;
        } catch (err) {
          // If subscription is expired or revoked (404/410), clean it up from DB
          if (err.statusCode === 404 || err.statusCode === 410) {
            logger.info(`Cleaning up stale Web Push subscription: ${sub.endpoint}`);
            await PushSubscription.deleteOne({ _id: sub._id });
          } else {
            logger.warn(`Failed to send Web Push to ${sub.endpoint}: ${err.message}`);
          }
        }
      })
    );

    return { sent: sentCount, total: subscriptions.length };
  }

  /**
   * List paginated notifications for a specific user
   */
  async listUserNotifications(accountId, { isRead, limit = 20, page = 1 } = {}) {
    const filter = { recipientAccountId: accountId };

    if (isRead !== undefined) {
      filter.isRead = isRead === 'true' || isRead === true;
    }

    const parsedLimit = Math.max(1, parseInt(limit, 10) || 20);
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
      Notification.countDocuments(filter),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit),
      },
    };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId, accountId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipientAccountId: accountId,
    });

    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  }

  /**
   * Mark all notifications for a user as read
   */
  async markAllAsRead(accountId) {
    const result = await Notification.updateMany(
      { recipientAccountId: accountId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return {
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Get unread notification count for badge display
   */
  async getUnreadCount(accountId) {
    const count = await Notification.countDocuments({
      recipientAccountId: accountId,
      isRead: false,
    });

    return { unreadCount: count };
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId, accountId) {
    const result = await Notification.deleteOne({
      _id: notificationId,
      recipientAccountId: accountId,
    });

    if (result.deletedCount === 0) {
      throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
    }

    return { success: true };
  }
}

module.exports = new NotificationService();
