const admin = require('firebase-admin');
const { logger } = require('../utils/logger');
const { FIREBASE_SERVICE_ACCOUNT } = require('../../config/env');
const Account = require('../../modules/auth/models/Account.model');
let firebaseInitialized = false;
const initializeFirebase = () => {
  if (firebaseInitialized) return;
  try {
    const sa = FIREBASE_SERVICE_ACCOUNT;
    if (!sa) { logger.warn('FIREBASE_SERVICE_ACCOUNT missing. FCM disabled.'); return; }
    let serviceAccount;
    try { serviceAccount = JSON.parse(sa); } catch (_) { serviceAccount = JSON.parse(Buffer.from(sa, 'base64').toString('utf8')); }
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    firebaseInitialized = true;
    logger.info('Firebase Admin SDK initialized.');
  } catch (err) { logger.error(err, 'Firebase init failed.'); }
};
const ALARM_CONFIG = {
  android: { priority: 'high', ttl: '0s', notification: { channel_id: 'medimind_alarm', priority: 'max', visibility: 'public', sound: 'default', default_vibrate_timings: true, click_action: 'FLUTTER_NOTIFICATION_CLICK', tag: 'alarm', notification_count: 1 } },
  apns: { payload: { aps: { contentAvailable: true, sound: 'default', badge: 1 } }, headers: { 'apns-priority': '10', 'apns-push-type': 'alert' } },
};
class FcmService {
  constructor() { initializeFirebase(); }
  async _resolveTokens(accountIds) {
    if (!accountIds || accountIds.length === 0) return [];
    const accounts = await Account.find({ _id: { $in: accountIds }, isActive: true }, { 'deviceTokens.token': 1, 'deviceTokens.platform': 1 }).lean();
    return accounts.flatMap(acc => acc.deviceTokens || []);
  }
  async sendAlarm(accountId, { title, body, data = {} }) {
    if (!firebaseInitialized) { logger.warn('FCM not init - skip alarm'); return { sent: 0, failed: 0 }; }
    const tokens = await this._resolveTokens([accountId]);
    if (tokens.length === 0) return { sent: 0, failed: 0 };
    let sent = 0, failed = 0;
    for (const { token } of tokens) {
      try { await admin.messaging().send({ token, notification: { title, body }, data: { ...data, type: 'ALARM', fullScreenIntent: 'true', priority: 'max' }, ...ALARM_CONFIG }); sent++; }
      catch (err) { logger.error(err, `FCM send failed: ${token.substring(0, 12)}...`); failed++; }
    }
    return { sent, failed };
  }
  async sendNotification(accountIds, { title, body, data = {}, type = 'INFO' }) {
    if (!firebaseInitialized) return { sent: 0, failed: 0 };
    const tokens = await this._resolveTokens(accountIds);
    if (tokens.length === 0) return { sent: 0, failed: 0 };
    let sent = 0, failed = 0;
    for (const { token } of tokens) {
      try { await admin.messaging().send({ token, notification: { title, body }, data: { ...data, type }, android: { priority: 'high', notification: { channel_id: 'medimind_notifications', priority: 'high', sound: 'default', click_action: 'FLUTTER_NOTIFICATION_CLICK' } }, apns: { payload: { aps: { contentAvailable: true, sound: 'default', badge: 1 } }, headers: { 'apns-priority': '10', 'apns-push-type': 'alert' } } }); sent++; }
      catch (err) { failed++; }
    }
    return { sent, failed };
  }
  async sendCaregiverEscalation(accountId, { patientName, medicationName, scheduledFor, snoozeCount }) {
    return this.sendNotification([accountId], { title: '⚠️ تنبيه: المريض لم يأخذ الدواء', body: `${patientName} لم يستجب لمنبه دواء ${medicationName} (${snoozeCount} مرات تأجيل)`, data: { type: 'CAREGIVER_ESCALATION', patientName, medicationName, scheduledFor: scheduledFor.toISOString(), snoozeCount: String(snoozeCount) } });
  }
  async sendLowInventoryAlert(accountId, { medicationName, currentQuantity, refillThreshold }) {
    return this.sendNotification([accountId], { title: '💊 دواءك على وشك النفاد', body: `${medicationName} — متبقي ${currentQuantity} جرعة (الحد الأدنى: ${refillThreshold})`, data: { type: 'LOW_INVENTORY', medicationName, currentQuantity: String(currentQuantity), refillThreshold: String(refillThreshold) } });
  }
  async sendDoctorEscalation(accountId, { patientName, medicationName, scheduledFor }) {
    return this.sendNotification([accountId], { title: '🚨 تنبيه طبي: مريض لم يستجب للدواء', body: `${patientName} — دواء ${medicationName} في ${scheduledFor.toLocaleString()}`, data: { type: 'DOCTOR_ESCALATION', patientName, medicationName, scheduledFor: scheduledFor.toISOString() } });
  }
}
module.exports = new FcmService();
