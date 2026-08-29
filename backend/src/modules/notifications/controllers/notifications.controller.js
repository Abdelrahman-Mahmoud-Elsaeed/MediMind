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

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const notificationService = require('../services/notification.service');
      await notificationService.deleteNotification(id, req.accountId);
      return new ServiceResponse({
        en: 'Notification deleted successfully.',
        ar: 'تم حذف الإشعار بنجاح.',
        data: {},
      }).send(res);
    } catch (error) {
      logger.error('Error deleting notification:', error);
      next(error);
    }
  }

  async getVapidPublicKey(req, res, next) {
    try {
      const { getPublicKey } = require('../../../config/webpush');
      return new ServiceResponse({
        en: 'VAPID public key retrieved.',
        ar: 'تم الحصول على المفتاح العام للإشعارات.',
        data: { vapidPublicKey: getPublicKey() },
      }).send(res);
    } catch (error) {
      logger.error('Error getting VAPID public key:', error);
      next(error);
    }
  }

  async savePushSubscription(req, res, next) {
    try {
      const notificationService = require('../services/notification.service');
      const userAgent = req.headers['user-agent'] || '';
      const subscription = await notificationService.savePushSubscription(req.accountId, {
        endpoint: req.body.endpoint,
        keys: req.body.keys,
        userAgent,
      });
      return new ServiceResponse({
        en: 'Push subscription saved successfully.',
        ar: 'تم حفظ اشتراك الإشعارات بنجاح.',
        data: subscription,
      }).send(res);
    } catch (error) {
      logger.error('Error saving push subscription:', error);
      next(error);
    }
  }

  async deletePushSubscription(req, res, next) {
    try {
      const notificationService = require('../services/notification.service');
      await notificationService.deletePushSubscription(req.accountId, req.body.endpoint);
      return new ServiceResponse({
        en: 'Push subscription removed successfully.',
        ar: 'تم إزالة اشتراك الإشعارات بنجاح.',
        data: {},
      }).send(res);
    } catch (error) {
      logger.error('Error removing push subscription:', error);
      next(error);
    }
  }
}

module.exports = new NotificationsController();
