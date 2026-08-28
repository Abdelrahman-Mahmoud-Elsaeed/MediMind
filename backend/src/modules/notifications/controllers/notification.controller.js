const notificationService = require('../services/notification.service');
const ServiceResponse = require('../../../shared/utils/ServiceResponse');
const { logger } = require('../../../shared/utils/logger');

class NotificationController {
  async list(req, res, next) {
    try {
      const result = await notificationService.listUserNotifications(req.accountId, req.query);
      return new ServiceResponse({
        en: 'Notifications retrieved successfully.',
        ar: 'تم استرجاع الإشعارات بنجاح.',
        data: {
          notifications: result.notifications,
          pagination: result.pagination,
        },
      }).send(res);
    } catch (error) {
      logger.error('Error listing notifications:', error);
      next(error);
    }
  }

  async markRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.accountId);
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

  async markAllRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.accountId);
      return new ServiceResponse({
        en: 'All notifications marked as read.',
        ar: 'تم تمييز جميع الإشعارات كمقروءة.',
        data: result,
      }).send(res);
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const result = await notificationService.getUnreadCount(req.accountId);
      return new ServiceResponse({
        en: 'Unread notification count retrieved.',
        ar: 'تم الحصول على عدد الإشعارات غير المقروءة.',
        data: result,
      }).send(res);
    } catch (error) {
      logger.error('Error getting unread notification count:', error);
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

  async delete(req, res, next) {
    try {
      await notificationService.deleteNotification(req.params.id, req.accountId);
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
}

module.exports = new NotificationController();
