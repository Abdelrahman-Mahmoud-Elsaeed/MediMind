const authService = require("../services/auth.service");
const patientService = require("../services/patient.service");
const familyCaregiverService = require("../services/familyCaregiver.service");
const doctorService = require("../services/doctor.service");
const pharmacistService = require("../services/pharmacist.service");
const professionalCaregiverService = require("../services/professionalCaregiver.service");

const AppError = require("../../../shared/utils/AppError");

class AuthController {
  // Helper just to set the cookie and clean the payload. Does NOT send the response.
  _setAuthCookie(res, result) {
    if (result?.data && result.data.refreshToken) {
      res.cookie("refreshToken", result.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      // Remove it so it doesn't leak in the JSON response
      delete result.data.refreshToken;
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      this._setAuthCookie(res, result);
      return result.send(res);
    } catch (error) {
      next(error);
    }
  }

  async refreshSession(req, res, next) {
    try {
      const rawRefreshToken = req.cookies.refreshToken;
      if (!rawRefreshToken) {
        throw new AppError("Refresh token is missing", 401, "MISSING_TOKEN", {
          en: "Session refresh token is missing.",
          ar: "رمز تحديث الجلسة مفقود.",
        });
      }

      const result = await authService.refreshSession(rawRefreshToken);
      this._setAuthCookie(res, result);
      return result.send(res);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const accountId = req.user?.accountId || req.body.accountId;
      const rawRefreshToken = req.cookies.refreshToken;

      const result = await authService.logout(accountId, rawRefreshToken);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      if (result.send && typeof result.send === "function") {
        return result.send(res);
      }
      
      // Fixed fallback
      return res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  async registerEmail(req, res, next) {
    try {
      const { role } = req.body;
      let result;

      if (role === "PATIENT") {
        result = await patientService.registerEmail(req.body);
      } else if (role === "FAMILY_CAREGIVER") {
        result = await familyCaregiverService.registerEmail(req.body);
      } else {
        // Fixed AppError localization
        throw new AppError(
          "Invalid role for email registration", 
          400, 
          "INVALID_ROLE",
          {
            en: "Invalid role for email registration.",
            ar: "دور غير صالح للتسجيل بالبريد الإلكتروني."
          }
        );
      }

      this._setAuthCookie(res, result);
      return result.send(res);
    } catch (error) {
      next(error);
    }
  }

  async registerPhone(req, res, next) {
    try {
      const { role } = req.body;
      let result;

      if (role === "PATIENT") {
        result = await patientService.registerPhone(req.body);
      } else if (role === "FAMILY_CAREGIVER") {
        result = await familyCaregiverService.registerPhone(req.body);
      } else {
        // Fixed AppError localization
        throw new AppError(
          "Invalid role for phone registration", 
          400, 
          "INVALID_ROLE",
          {
            en: "Invalid role for phone registration.",
            ar: "دور غير صالح للتسجيل برقم الهاتف."
          }
        );
      }

      this._setAuthCookie(res, result);
      return result.send(res);
    } catch (error) {
      next(error);
    }
  }

  async registerProvider(req, res, next) {
    try {
      const { role } = req.body;
      let result;

      switch (role) {
        case "DOCTOR":
          result = await doctorService.registerProvider(req.body);
          break;
        case "PHARMACIST":
          result = await pharmacistService.registerProvider(req.body);
          break;
        case "PROFESSIONAL_CAREGIVER":
          result = await professionalCaregiverService.registerProvider(req.body);
          break;
        default:
          // Fixed AppError localization
          throw new AppError(
            "Invalid provider role", 
            400, 
            "INVALID_ROLE",
            {
              en: "Invalid provider role.",
              ar: "دور مزود الخدمة غير صالح."
            }
          );
      }

      this._setAuthCookie(res, result);
      return result.send(res);
    } catch (error) {
      next(error);
    }
  }
}

const authController = new AuthController();
// Bind the helper to ensure 'this' context isn't lost
authController._setAuthCookie = authController._setAuthCookie.bind(authController);
authController.login = authController.login.bind(authController);
authController.refreshSession = authController.refreshSession.bind(authController);
authController.logout = authController.logout.bind(authController);
authController.registerEmail = authController.registerEmail.bind(authController);
authController.registerPhone = authController.registerPhone.bind(authController);
authController.registerProvider = authController.registerProvider.bind(authController);

module.exports = authController;