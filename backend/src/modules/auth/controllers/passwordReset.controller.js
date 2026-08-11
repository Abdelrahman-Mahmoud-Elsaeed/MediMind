const passwordResetService = require("../services/passwordReset.service");
const ServiceResponse = require("../../../shared/utils/ServiceResponse");

class PasswordResetController {
  /**
   * POST /api/v1/auth/password/forgot
   * Public endpoint -- no authentication required.
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      await passwordResetService.forgotPassword({ email });

      // Always return success to prevent account enumeration
      const response = new ServiceResponse({
        success: true,
        status: "SUCCESS",
        data: {},
        en: "If an account with this email exists, a password reset link has been sent.",
        ar: "إن كان هذا البريد الإلكتروني مسجلاً لدينا، فلقد تم إرسال رابط استعادة كلمة المرور.",
      });

      return response.send(res, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/password/reset
   * Public endpoint -- no authentication required.
   */
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const result = await passwordResetService.resetPassword({
        token,
        newPassword,
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
  }
}

module.exports = new PasswordResetController();
