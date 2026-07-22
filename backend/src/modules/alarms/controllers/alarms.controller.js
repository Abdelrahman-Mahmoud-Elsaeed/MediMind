const alarmsService = require('../services/alarms.service');
const { logger } = require('../../../shared/utils/logger');
class AlarmsController {
  async snooze(req, res, next) { try { const r = await alarmsService.snoozeAlarm(req.accountId, req.role, req.params.alarmEventId); res.status(200).json({ success: true, data: { alarmEventId: r._id, status: r.status, snoozeCount: r.snoozeCount, snoozedUntil: r.snoozedUntil, maxSnoozeCount: r.maxSnoozeCount, escalatedToCaregiverAt: r.escalatedToCaregiverAt } }); } catch (e) { logger.error(e, 'snooze'); next(e); } }
  async dismiss(req, res, next) { try { const r = await alarmsService.dismissAlarm(req.accountId, req.role, req.params.alarmEventId); res.status(200).json({ success: true, data: { alarmEventId: r._id, status: r.status, snoozeCount: r.snoozeCount, snoozedUntil: r.snoozedUntil } }); } catch (e) { logger.error(e, 'dismiss'); next(e); } }
  async confirmTaken(req, res, next) { try { const r = await alarmsService.confirmTaken(req.accountId, req.role, req.params.alarmEventId); res.status(200).json({ success: true, data: r }); } catch (e) { logger.error(e, 'confirmTaken'); next(e); } }
  async acknowledge(req, res, next) { try { const r = await alarmsService.acknowledgeAlarm(req.accountId, req.role, req.params.alarmEventId); res.status(200).json({ success: true, data: r }); } catch (e) { logger.error(e, 'acknowledge'); next(e); } }
  async getActive(req, res, next) { try { const patientId = req.query.patientId || null; const a = await alarmsService.getActiveAlarms(req.accountId, req.role, patientId); res.status(200).json({ success: true, data: a }); } catch (e) { logger.error(e, 'getActive'); next(e); } }
  async getByDose(req, res, next) { try { const a = await alarmsService.getAlarmByDose(req.accountId, req.role, req.params.doseEventId); if (!a) return res.status(404).json({ success: false, error: { code: 'ALARM_NOT_FOUND', message: 'Not found', messages: { en: 'No alarm found.', ar: 'لا يوجد منبه.' } } }); res.status(200).json({ success: true, data: a }); } catch (e) { logger.error(e, 'getByDose'); next(e); } }
}
module.exports = new AlarmsController();
