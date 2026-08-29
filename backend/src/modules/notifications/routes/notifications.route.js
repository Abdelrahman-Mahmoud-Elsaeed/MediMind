const express = require('express');
const notificationsController = require('../controllers/notifications.controller');
const { authenticate } = require('../../../shared/middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', notificationsController.list);
router.get('/unread-count', notificationsController.getUnreadCount);
router.patch('/read-all', notificationsController.markAllAsRead);
router.patch('/:id/read', notificationsController.markAsRead);
router.delete('/:id', notificationsController.delete);
router.get('/vapid-public-key', notificationsController.getVapidPublicKey);
router.post('/push-subscription', notificationsController.savePushSubscription);
router.delete('/push-subscription', notificationsController.deletePushSubscription);

module.exports = router;
