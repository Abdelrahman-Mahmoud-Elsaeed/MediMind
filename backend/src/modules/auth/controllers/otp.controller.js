const otpService = require("../services/otp.service");
const { logger } = require("../../../shared/utils/logger");

class OtpController {
  async sendOtp(req, res, next) {
    try {
      const result = await otpService.sendOtp(req.accountId);
      return result.send(res);
    } catch (error) {
      logger.error(error, "Error sending OTP");
      next(error);
    }
  }

  async verifyOtp(req, res, next) {
    try {
      const { code } = req.body;
      const result = await otpService.verifyOtp(req.accountId, code);
      return result.send(res);
    } catch (error) {
      logger.error(error, "Error verifying OTP");
      next(error);
    }
  }
}

module.exports = new OtpController();
