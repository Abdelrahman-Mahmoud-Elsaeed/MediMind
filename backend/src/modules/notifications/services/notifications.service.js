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
    recipientAccountId = null,
    recipientRole = 'PATIENT',
    senderId = null,
    type = 'GENERAL',
    title,
    titleAr = null,
    message,
    messageAr = null,
    data = {},
  }) {
    const targetId = recipientId || recipientAccountId;
    if (!targetId || !title || !message) {
      throw new AppError('recipientId, title, and message are required for notifications', 400, 'INVALID_NOTIFICATION_DATA');
    }

    // 1. Save to Database (Persistent Source of Truth)
    const notification = await Notification.create({
      recipientId: targetId,
      recipientAccountId: targetId,
      recipientRole,
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
      _id: notification._id.toString(),
      recipientId: targetId.toString(),
      recipientAccountId: targetId.toString(),
      recipientRole,
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
      socketService.sendToUser(targetId.toString(), 'notification:new', payload);
      socketService.sendToUser(targetId.toString(), 'notification', payload);
    } catch (err) {
      logger.error(`Failed to emit socket notification to user ${targetId}:`, err);
    }

    return notification;
  }

  /**
   * Lists persisted notifications for the authenticated user from DB.
   */
  async getUserNotifications(accountId, limit = 50) {
    const list = await Notification.find({
      $or: [{ recipientAccountId: accountId }, { recipientId: accountId }],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return list.map((item) => ({
      id: item._id.toString(),
      notificationId: item._id.toString(),
      _id: item._id.toString(),
      recipientId: item.recipientId ? item.recipientId.toString() : null,
      recipientAccountId: item.recipientAccountId ? item.recipientAccountId.toString() : null,
      senderId: item.senderId ? item.senderId.toString() : null,
      recipientRole: item.recipientRole,
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
      $or: [{ recipientAccountId: accountId }, { recipientId: accountId }],
      isRead: false,
    });
    return count;
  }

  /**
   * Marks a single notification as read.
   */
  async markAsRead(accountId, notificationId) {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        $or: [{ recipientAccountId: accountId }, { recipientId: accountId }],
      },
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
      {
        $or: [{ recipientAccountId: accountId }, { recipientId: accountId }],
        isRead: false,
      },
      { isRead: true, readAt: new Date() }
    );
    return { success: true };
  }
}

module.exports = new NotificationsService();

