const webpush = require('web-push');
const { VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = require('./env');
const { logger } = require('../shared/utils/logger');

const subject = VAPID_SUBJECT || 'mailto:admin@medimind.app';
const publicKey = VAPID_PUBLIC_KEY;
const privateKey = VAPID_PRIVATE_KEY;

let isConfigured = false;

if (publicKey && privateKey && !publicKey.includes('dummy') && !privateKey.includes('dummy')) {
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    isConfigured = true;
    logger.info('[WebPush] VAPID details configured successfully');
  } catch (err) {
    logger.warn({ error: err.message }, '[WebPush] Failed to set VAPID details: ' + err.message);
  }
} else {
  logger.info('[WebPush] VAPID keys missing or using placeholder values; web push fallback active');
}

module.exports = {
  webpush,
  isConfigured: () => isConfigured,
  getPublicKey: () => publicKey || '',
};
