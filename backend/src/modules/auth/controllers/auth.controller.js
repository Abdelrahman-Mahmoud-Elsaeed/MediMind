const authService = require("../services/auth.service");
const patientService = require("../services/patient.service");
const familyCaregiverService = require("../services/familyCaregiver.service");
const doctorService = require("../services/doctor.service");
const pharmacistService = require("../services/pharmacist.service");
const professionalCaregiverService = require("../services/professionalCaregiver.service");
const adminController = require("./admin.controller");
const otpService = require("../services/otp.service");
const AppError = require("../../../shared/utils/AppError");

class AuthController {
  _setAuthCookie(res, result) {
    if (result?.data && result.data.refreshToken) {
      res.cookie("refreshToken", result.data.refreshToken, {
        httpOnly: true, secure: process.env.NODE_ENV === "production",
        sameSite: "strict", path: "/", maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      delete result.data.refreshToken;
    }
  }

  async login(req, res, next) {
    try { const result = await authService.login(req.body); this._setAuthCookie(res, result); return result.send(res); }
    catch (error) { next(error); }
  }

  async refreshSession(req, res, next) {
    try {
      const rawRefreshToken = req.cookies.refreshToken;
      if (!rawRefreshToken) throw new AppError("Refresh token is missing", 401, "MISSING_TOKEN", { en: "Refresh token missing.", ar: "رمز التحديث مفقود." });
      const result = await authService.refreshSession(rawRefreshToken);
      this._setAuthCookie(res, result);
      return result.send(res);
    } catch (error) { next(error); }
  }

  async logout(req, res, next) {
    try {
      const accountId = req.accountId;
      const rawRefreshToken = req.cookies.refreshToken;
      const result = await authService.logout(accountId, rawRefreshToken);
      res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/" });
      return result.send(res);
    } catch (error) { next(error); }
  }

  async registerEmail(req, res, next) {
    try {
      const { role } = req.body; let result;
      if (role === "PATIENT") result = await patientService.registerEmail(req.body);
      else if (role === "FAMILY_CAREGIVER") result = await familyCaregiverService.registerEmail(req.body);
      else throw new AppError("Invalid role", 400, "INVALID_ROLE", { en: "Invalid role.", ar: "دور غير صالح." });
      // Auto-send OTP after registration
      try { await otpService.sendOtp(result.data.user.accountId); } catch (e) { /* non-fatal */ }
      this._setAuthCookie(res, result);
      return result.send(res);
    } catch (error) { next(error); }
  }

  async registerPhone(req, res, next) {
    try {
      const { role } = req.body; let result;
      if (role === "PATIENT") result = await patientService.registerPhone(req.body);
      else if (role === "FAMILY_CAREGIVER") result = await familyCaregiverService.registerPhone(req.body);
      else throw new AppError("Invalid role", 400, "INVALID_ROLE", { en: "Invalid role.", ar: "دور غير صالح." });
      this._setAuthCookie(res, result);
      return result.send(res);
    } catch (error) { next(error); }
  }

  async registerProvider(req, res, next) {
    try {
      const { role } = req.body; let result;
      switch (role) {
        case "DOCTOR": result = await doctorService.registerProvider(req.body); break;
        case "PHARMACIST": result = await pharmacistService.registerProvider(req.body); break;
        case "PROFESSIONAL_CAREGIVER": result = await professionalCaregiverService.registerProvider(req.body); break;
        default: throw new AppError("Invalid provider role", 400, "INVALID_ROLE", { en: "Invalid provider role.", ar: "دور مزود غير صالح." });
      }
      // Auto-send OTP after provider registration
      try { await otpService.sendOtp(result.data.accountId); } catch (e) { /* non-fatal */ }
      return result.send(res);
    } catch (error) { next(error); }
  }
}

const authController = new AuthController();
authController._setAuthCookie = authController._setAuthCookie.bind(authController);
authController.login = authController.login.bind(authController);
authController.refreshSession = authController.refreshSession.bind(authController);
authController.logout = authController.logout.bind(authController);
authController.registerEmail = authController.registerEmail.bind(authController);
authController.registerPhone = authController.registerPhone.bind(authController);
authController.registerProvider = authController.registerProvider.bind(authController);

module.exports = authController;
