const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../../../shared/middleware/auth.middleware');

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/vapid-public-key', notificationController.getVapidPublicKey);
router.post('/push-subscription', notificationController.savePushSubscription);
router.delete('/push-subscription', notificationController.deletePushSubscription);
router.get('/', notificationController.list);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);
router.delete('/:id', notificationController.delete);

module.exports = router;
