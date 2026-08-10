const express = require('express');
const notificationsController = require('../controllers/notifications.controller');
const { authenticate } = require('../../../shared/middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', notificationsController.list);
router.get('/unread-count', notificationsController.getUnreadCount);
router.patch('/:id/read', notificationsController.markAsRead);
router.patch('/read-all', notificationsController.markAllAsRead);

module.exports = router;
