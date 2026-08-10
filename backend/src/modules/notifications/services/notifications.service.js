const Notification = require('../models/Notification.model');
const socketService = require('../../socket/services/socket.service');
const AppError = require('../../../shared/utils/AppError');
const { logger } = require('../../../shared/utils/logger');

class NotificationsService {
  /**
   * Persists a notification to the database and emits real-time delivery via Socket.IO.
   */
  async createNotification({
    recipientId,
    senderId = null,
    type = 'GENERAL',
    title,
    titleAr = null,
    message,
    messageAr = null,
    data = {},
  }) {
    if (!recipientId || !title || !message) {
      throw new AppError('recipientId, title, and message are required for notifications', 400, 'INVALID_NOTIFICATION_DATA');
    }

    // 1. Save to Database (Persistent Source of Truth)
    const notification = await Notification.create({
      recipientId,
      senderId,
      type,
      title,
      titleAr,
      message,
      messageAr,
      data,
    });

    const payload = {
      id: notification._id.toString(),
      notificationId: notification._id.toString(),
      recipientId: notification.recipientId.toString(),
      senderId: notification.senderId ? notification.senderId.toString() : null,
      type: notification.type,
      title: notification.title,
      titleAr: notification.titleAr,
      message: notification.message,
      messageAr: notification.messageAr,
      isRead: notification.isRead,
      readAt: notification.readAt,
      data: notification.data,
      createdAt: notification.createdAt,
    };

    // 2. Real-time Delivery via Socket.IO
    try {
      socketService.sendToUser(recipientId.toString(), 'notification:new', payload);
    } catch (err) {
      logger.error(`Failed to emit socket notification to user ${recipientId}:`, err);
    }

    return notification;
  }

  /**
   * Lists persisted notifications for the authenticated user from DB.
   */
  async getUserNotifications(accountId, limit = 50) {
    const list = await Notification.find({ recipientId: accountId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return list.map((item) => ({
      id: item._id.toString(),
      notificationId: item._id.toString(),
      recipientId: item.recipientId.toString(),
      senderId: item.senderId ? item.senderId.toString() : null,
      type: item.type,
      title: item.title,
      titleAr: item.titleAr,
      message: item.message,
      messageAr: item.messageAr,
      isRead: item.isRead,
      readAt: item.readAt,
      data: item.data,
      createdAt: item.createdAt,
    }));
  }

  /**
   * Gets unread notifications count for a user.
   */
  async getUnreadCount(accountId) {
    const count = await Notification.countDocuments({
      recipientId: accountId,
      isRead: false,
    });
    return count;
  }

  /**
   * Marks a single notification as read.
   */
  async markAsRead(accountId, notificationId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: accountId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      throw new AppError('Notification not found or access denied', 404, 'NOTIFICATION_NOT_FOUND');
    }

    return notification;
  }

  /**
   * Marks all unread notifications for a user as read.
   */
  async markAllAsRead(accountId) {
    await Notification.updateMany(
      { recipientId: accountId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return { success: true };
  }
}

module.exports = new NotificationsService();
