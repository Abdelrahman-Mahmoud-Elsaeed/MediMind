const pushService = require('../services/push.service');
const notificationService = require('../services/notification.service');
const { logger } = require('../../../sheared/utils/logger');

class NotificationController {

  /**
   * GET /notifications/vapid-public-key
   * Get VAPID public key (for frontend to subscribe)
   */
  getVapidPublicKey(req, res) {
    const publicKey = pushService.getPublicKey();
    if (!publicKey) {
      return res.status(503).json({
        success: false,
        error: { code: 'PUSH_NOT_CONFIGURED', message: 'Push notifications are not configured' }
      });
    }
    res.status(200).json({ success: true, data: { publicKey } });
  }

  /**
   * POST /notifications/subscribe
   * Save a push subscription
   * @body { endpoint, keys: { p256dh, auth } }
   */
  async subscribe(req, res, next) {
    try {
      const userAgent = req.headers['user-agent'] || '';
      const deviceType = /mobile|android|iphone/i.test(userAgent) ? 'mobile'
                       : /tablet|ipad/i.test(userAgent) ? 'tablet'
                       : /desktop|windows|mac/i.test(userAgent) ? 'desktop'
                       : 'unknown';

      await pushService.subscribe(req.accountId, req.body, { userAgent, deviceType });
      res.status(201).json({ success: true, data: { message: 'تم تسجيل الاشتراك بنجاح' } });
    } catch (error) {
      logger.error('Subscribe error:', error);
      next(error);
    }
  }

  /**
   * POST /notifications/unsubscribe
   * Remove a push subscription
   */
  async unsubscribe(req, res, next) {
    try {
      const removed = await pushService.unsubscribe(req.accountId, req.body.endpoint);
      res.status(200).json({ success: true, data: { removed } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /notifications
   * Get notification history for current user
   * @query limit, offset, type, channel
   */
  async getHistory(req, res, next) {
    try {
      const { limit, offset, type, channel } = req.query;
      const history = await notificationService.getHistory(req.accountId, {
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
        type, channel
      });
      res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /notifications/:id/click
   * Mark notification as clicked
   */
  async markClicked(req, res, next) {
    try {
      const log = await notificationService.markAsClicked(req.params.id);
      res.status(200).json({ success: true, data: log });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /notifications/test
   * Send a test push notification to the current user
   */
  async sendTest(req, res, next) {
    try {
      const result = await pushService.send(
        req.accountId,
        {
          title: '🔧 تجربة الإشعارات',
          body: 'الإشعارات شغالة بنجاح! حتستلم تذكيرات أدويتك هنا. 💊',
          data: { action: 'TEST' }
        },
        { type: 'CUSTOM' }
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
