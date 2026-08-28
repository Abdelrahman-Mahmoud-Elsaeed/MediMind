const notificationsService = require('../services/notifications.service');
const ServiceResponse = require('../../../shared/utils/ServiceResponse');
const { logger } = require('../../../shared/utils/logger');

class NotificationsController {
  async list(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const notifications = await notificationsService.getUserNotifications(req.accountId, limit);
      return new ServiceResponse({
        en: 'Notifications retrieved successfully.',
        ar: 'تم استرجاع الإشعارات بنجاح.',
        data: notifications,
      }).send(res);
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const count = await notificationsService.getUnreadCount(req.accountId);
      return new ServiceResponse({
        en: 'Unread count retrieved.',
        ar: 'تم الحصول على عدد الإشعارات غير المقروءة.',
        data: { unreadCount: count },
      }).send(res);
    } catch (error) {
      logger.error('Error fetching unread count:', error);
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await notificationsService.markAsRead(req.accountId, id);
      return new ServiceResponse({
        en: 'Notification marked as read.',
        ar: 'تم تمييز الإشعار كمقروء.',
        data: notification,
      }).send(res);
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await notificationsService.markAllAsRead(req.accountId);
      return new ServiceResponse({
        en: 'All notifications marked as read.',
        ar: 'تم تمييز جميع الإشعارات كمقروءة.',
        data: {},
      }).send(res);
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      next(error);
    }
  }
}

module.exports = new NotificationsController();
