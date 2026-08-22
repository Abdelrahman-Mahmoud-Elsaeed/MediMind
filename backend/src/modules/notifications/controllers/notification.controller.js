const notificationService = require('../services/notification.service');
const { logger } = require('../../../shared/utils/logger');

class NotificationController {
  async list(req, res, next) {
    try {
      const result = await notificationService.listUserNotifications(req.accountId, req.query);
      res.status(200).json({
        success: true,
        data: result.notifications,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Error listing notifications:', error);
      next(error);
    }
  }

  async markRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.accountId);
      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      next(error);
    }
  }

  async markAllRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.accountId);
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
        data: result,
      });
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const result = await notificationService.getUnreadCount(req.accountId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error getting unread notification count:', error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await notificationService.deleteNotification(req.params.id, req.accountId);
      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting notification:', error);
      next(error);
    }
  }
}

module.exports = new NotificationController();
