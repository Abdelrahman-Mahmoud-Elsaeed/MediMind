const notificationsService = require('../services/notifications.service');
const { logger } = require('../../../shared/utils/logger');

class NotificationsController {
  async list(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const notifications = await notificationsService.getUserNotifications(req.accountId, limit);
      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const count = await notificationsService.getUnreadCount(req.accountId);
      res.status(200).json({
        success: true,
        data: { unreadCount: count },
      });
    } catch (error) {
      logger.error('Error fetching unread count:', error);
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await notificationsService.markAsRead(req.accountId, id);
      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await notificationsService.markAllAsRead(req.accountId);
      res.status(200).json({
        success: true,
        data: { message: 'All notifications marked as read' },
      });
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      next(error);
    }
  }
}

module.exports = new NotificationsController();
