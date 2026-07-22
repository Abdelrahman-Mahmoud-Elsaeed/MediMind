const devicesService = require('../services/devices.service');
const { logger } = require('../../../shared/utils/logger');
class DevicesController {
  async register(req, res, next) { try { const r = await devicesService.registerDevice(req.accountId, req.role, req.body); return r.send(res); } catch (e) { logger.error(e, 'register device'); next(e); } }
  async unregister(req, res, next) { try { const r = await devicesService.unregisterDevice(req.accountId, req.body.token); return r.send(res); } catch (e) { logger.error(e, 'unregister device'); next(e); } }
  async list(req, res, next) { try { const d = await devicesService.listDevices(req.accountId); res.status(200).json({ success: true, data: d }); } catch (e) { logger.error(e, 'list devices'); next(e); } }
}
module.exports = new DevicesController();
