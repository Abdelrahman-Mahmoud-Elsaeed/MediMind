const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const adminController = require("../controllers/admin.controller");
const otpController = require("../controllers/otp.controller");
const validateByRole = require("../../../shared/middleware/validateByRole.middleware");
const {
  authenticate,
  authorize,
} = require("../../../shared/middleware/auth.middleware");
const validate = require("../../../shared/middleware/validation.middleware");
const { authRateLimiter } = require("../../../shared/middleware/rateLimit.middleware");

// Validation Schemas
const { loginSchema } = require("../validators/auth.validation");
const {
  sendOtpSchema,
  verifyOtpSchema,
} = require("../validators/otp.validation");

const {
  registerProviderSchema: doctorSchema,
} = require("../validators/doctor.validation");
const {
  registerPharmacistSchema,
} = require("../validators/pharmacist.validation");
const {
  registerProfessionalCaregiverSchema,
} = require("../validators/professionalCaregiver.validation");
const {
  registerSchema: patientSchema,
} = require("../validators/patient.validation");
const {
  registerFamilyCaregiverSchema,
} = require("../validators/familyCaregiver.validation");

const {
  registerProfessionalSchema,
  registerProviderSchema: adminRegisterProviderSchema,
  updateAccountStatusSchema,
} = require("../validators/admin.validation");

// Map all self-registration schemas by role
const registerSchemas = {
  PATIENT: patientSchema,
  FAMILY_CAREGIVER: registerFamilyCaregiverSchema,
  DOCTOR: doctorSchema,
  PHARMACIST: registerPharmacistSchema,
  PROFESSIONAL_CAREGIVER: registerProfessionalCaregiverSchema,
};

// --- Public Auth Routes (Rate Limited) ---
router.post("/login", authRateLimiter, validate(loginSchema), authController.login);
router.post("/token/refresh", authRateLimiter, authController.refreshSession);

// --- Self-Registration Route (Rate Limited) ---
router.post(
  "/register",
  authRateLimiter,
  validateByRole(registerSchemas),
  authController.register,
);

// --- OTP Routes (requires auth + rate limited) ---
router.post(
  "/otp/send",
  authRateLimiter,
  authenticate,
  validate(sendOtpSchema),
  otpController.sendOtp,
);
router.post(
  "/otp/verify",
  authRateLimiter,
  authenticate,
  validate(verifyOtpSchema),
  otpController.verifyOtp,
);

// --- Authenticated User Routes ---
router.post("/logout", authenticate, authController.logout);
router.get("/verify-token", authenticate, authController.verifyToken);

// --- Admin-Only Routes ---
router.use("/admin", authenticate, authorize("ADMIN"));
router.post(
  "/admin/register/professional",
  authRateLimiter,
  validate(registerProfessionalSchema),
  adminController.registerProfessional,
);
router.post(
  "/admin/register/provider",
  authRateLimiter,
  validate(adminRegisterProviderSchema),
  adminController.registerProvider,
);
router.patch("/admin/verify/doctor/:id", adminController.verifyDoctor);
router.patch("/admin/verify/pharmacist/:id", adminController.verifyPharmacist);
router.patch(
  "/admin/accounts/:id/status",
  validate(updateAccountStatusSchema),
  adminController.updateAccountStatus,
);

module.exports = router;