const authService = require("../services/auth.service");
const patientService = require("../services/patient.service");
const familyCaregiverService = require("../services/familyCaregiver.service");
const doctorService = require("../services/doctor.service");
const pharmacistService = require("../services/pharmacist.service");
const professionalCaregiverService = require("../services/professionalCaregiver.service");
const AppError = require("../../../shared/utils/AppError");

class AuthController {
  // Helper just to set the cookie and clean the payload. Does NOT send the response.
  _setAuthCookie = (res, result) => {
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
  };

  login = async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      this._setAuthCookie(res, result);
      return result.send(res);
    } catch (error) {
      next(error);
    }
  };

  refreshSession = async (req, res, next) => {
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
  };

  logout = async (req, res, next) => {
    try {
      const accountId = req.accountId || req.body.accountId;
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

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  register = async (req, res, next) => {
    try {
      const { role, credentials } = req.body;
      const { email, phone } = credentials || {};

      let result;

      const isEmailAuth = Boolean(email);
      const isPhoneAuth = Boolean(phone);

      // Enforce strictly one credential type (either email or phone)
      if ((isEmailAuth && isPhoneAuth) || (!isEmailAuth && !isPhoneAuth)) {
        throw new AppError(
          "Credentials must contain either email or phone, but not both",
          400,
          "INVALID_CREDENTIALS",
          {
            en: "Please provide either an email or a phone number in credentials.",
            ar: "يرجى تقديم إما البريد الإلكتروني أو رقم الهاتف في بيانات الاعتماد.",
          },
        );
      }

      const providerRoles = ["DOCTOR", "PHARMACIST", "PROFESSIONAL_CAREGIVER"];

      if (providerRoles.includes(role)) {
        switch (role) {
          case "DOCTOR":
            result = await doctorService.registerProvider(req.body);
            break;
          case "PHARMACIST":
            result = await pharmacistService.registerProvider(req.body);
            break;
          case "PROFESSIONAL_CAREGIVER":
            result = await professionalCaregiverService.registerProvider(
              req.body,
            );
            break;
        }
      } else if (role === "PATIENT" || role === "FAMILY_CAREGIVER") {
        const service =
          role === "PATIENT" ? patientService : familyCaregiverService;

        if (isEmailAuth) {
          result = await service.registerEmail(req.body);
        } else {
          result = await service.registerPhone(req.body);
        }
      } else {
        throw new AppError(
          "Invalid role for registration",
          400,
          "INVALID_ROLE",
          {
            en: "Invalid registration role specified.",
            ar: "الدور المحدد للتسجيل غير صالح.",
          },
        );
      }

      if (result.status === "SUCCESS") {
        this._setAuthCookie(res, result);
      }

      return result.send(res);
    } catch (error) {
      next(error);
    }
  };

  verifyToken = async (req, res, next) => {
    try {
      const Account = require("../models/Account.model");
      const account = await Account.findById(req.accountId);
      if (!account) {
        throw new AppError("Account not found", 404, "ACCOUNT_NOT_FOUND", {
          en: "Account not found.",
          ar: "الحساب غير موجود."
        });
      }
      return res.status(200).json({
        success: true,
        status: "SUCCESS",
        messages: ["Token is valid"],
        data: {
          user: {
            accountId: account._id,
            role: account.role,
            email: account.email,
            phone: account.phone,
            isEmailVerified: account.isEmailVerified,
            isPhoneVerified: account.isPhoneVerified,
            isVerified: account.isEmailVerified || account.isPhoneVerified,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AuthController();
