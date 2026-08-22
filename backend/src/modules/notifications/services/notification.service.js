const Notification = require('../models/Notification.model');
const { emitToUser, emitToPharmacy, emitToRole } = require('../../../config/socket');
const { logger } = require('../../../shared/utils/logger');
const AppError = require('../../../shared/utils/AppError');

class NotificationService {
  /**
   * Persist a notification in MongoDB and dispatch real-time Socket.IO alerts
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
