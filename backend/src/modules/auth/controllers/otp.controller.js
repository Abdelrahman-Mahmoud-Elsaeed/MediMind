const otpService = require("../services/otp.service");
const ServiceResponse = require("../../../shared/utils/ServiceResponse");

class OtpController {
  /**
   * HTTP POST Handler: /api/v1/auth/otp/send
   * Dispatches a secure 6-digit verification code via designated transport medium
   */
  sendOtp = async (req, res, next) => {
    try {
      const { target, type } = req.body;
      const accountId = req.accountId;
      const result = await otpService.sendOtp({
        accountId: accountId,
        target,
        type,
      });

      // Encapsulate structural payload metrics explicitly using your ServiceResponse architecture
      const response = new ServiceResponse({
        success: true,
        status: "SUCCESS",
        data: {},
        en: result.messages.en,
        ar: result.messages.ar,
      });

      return response.send(res, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * HTTP POST Handler: /api/v1/auth/otp/verify
   * Evaluates input security token code bounds and mutates explicit verification flags on target profile
   */
  verifyOtp = async (req, res, next) => {
    try {
      const { type, code } = req.body;
      const accountId = req.accountId;

      const result = await otpService.verifyOtp({
        accountId: accountId,
        type,
        code,
      });

      const response = new ServiceResponse({
        success: true,
        status: "SUCCESS",
        data: {},
        en: result.messages.en,
        ar: result.messages.ar,
      });

      return response.send(res, 200);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new OtpController();
