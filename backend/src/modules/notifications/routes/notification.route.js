const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../../../sheared/middleware/auth.middleware');
const validate = require('../../../sheared/middleware/validation.middleware');
const { z } = require('zod');

const subscribeSchema = z.object({
  body: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string()
    })
  })
});

const unsubscribeSchema = z.object({
  body: z.object({
    endpoint: z.string()
  })
});

// All routes require authentication (except VAPID key)
router.get('/vapid-public-key', authenticate, notificationController.getVapidPublicKey);

router.use(authenticate);

/**
 * @route   POST /api/v1/notifications/subscribe
 * @desc    Save a PWA push subscription
 * @access  Private
 */
router.post('/subscribe', validate(subscribeSchema), notificationController.subscribe);

/**
 * @route   POST /api/v1/notifications/unsubscribe
 * @desc    Remove a PWA push subscription
 * @access  Private
 */
router.post('/unsubscribe', validate(unsubscribeSchema), notificationController.unsubscribe);

/**
 * @route   GET /api/v1/notifications
 * @desc    Get notification history
 * @access  Private
 */
router.get('/', notificationController.getHistory);

/**
 * @route   POST /api/v1/notifications/:id/click
 * @desc    Mark notification as clicked
 * @access  Private
 */
router.post('/:id/click', notificationController.markClicked);

/**
 * @route   POST /api/v1/notifications/test
 * @desc    Send a test push notification
 * @access  Private
 */
router.post('/test', notificationController.sendTest);

module.exports = router;
