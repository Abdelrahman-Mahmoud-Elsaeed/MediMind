const Account = require('../../auth/models/Account.model');
const AppError = require('../../../shared/utils/AppError');
const ServiceResponse = require('../../../shared/utils/ServiceResponse');
class DevicesService {
  async registerDevice(accountId, role, payload) {
    if (role !== 'PATIENT' && role !== 'FAMILY_CAREGIVER') throw new AppError('Only patients and caregivers', 403, 'FORBIDDEN', { en: 'Only patients and caregivers.', ar: 'فقط المرضى ومقدمو الرعاية.' });
    const { token, platform, deviceId, appVersion } = payload;
    const account = await Account.findById(accountId);
    if (!account) throw new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND', { en: 'Not found.', ar: 'غير موجود.' });
    const existingIdx = account.deviceTokens.findIndex(dt => dt.token === token);
    if (existingIdx >= 0) { account.deviceTokens[existingIdx].platform = platform; account.deviceTokens[existingIdx].lastUsedAt = new Date(); if (deviceId !== undefined) account.deviceTokens[existingIdx].deviceId = deviceId; if (appVersion !== undefined) account.deviceTokens[existingIdx].appVersion = appVersion; }
    else { if (account.deviceTokens.length >= 5) { account.deviceTokens.sort((a, b) => a.lastUsedAt - b.lastUsedAt); account.deviceTokens.shift(); } account.deviceTokens.push({ token, platform, deviceId: deviceId || null, appVersion: appVersion || null, lastUsedAt: new Date() }); }
    account.markModified('deviceTokens'); await account.save();
    return new ServiceResponse({ status: 'SUCCESS', en: 'Device registered.', ar: 'تم تسجيل الجهاز.', data: { deviceCount: account.deviceTokens.length, platform } });
  }
  async unregisterDevice(accountId, token) {
    const account = await Account.findById(accountId);
    if (!account) throw new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND', { en: 'Not found.', ar: 'غير موجود.' });
    account.deviceTokens = account.deviceTokens.filter(dt => dt.token !== token);
    account.markModified('deviceTokens'); await account.save();
    return new ServiceResponse({ status: 'SUCCESS', en: 'Device unregistered.', ar: 'تم إلغاء تسجيل الجهاز.', data: { deviceCount: account.deviceTokens.length } });
  }
  async listDevices(accountId) {
    const account = await Account.findById(accountId, 'deviceTokens').lean();
    if (!account) throw new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND', { en: 'Not found.', ar: 'غير موجود.' });
    return account.deviceTokens || [];
  }
}
module.exports = new DevicesService();
