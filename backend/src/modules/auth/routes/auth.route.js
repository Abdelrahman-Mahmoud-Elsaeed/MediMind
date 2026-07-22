const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const adminController = require("../controllers/admin.controller");
const otpController = require("../controllers/otp.controller");
const validateByRole = require("../../../shared/middleware/validateByRole.middleware");
const { authenticate, authorize } = require("../../../shared/middleware/auth.middleware");
const validate = require("../../../shared/middleware/validation.middleware");
const { loginSchema } = require("../validators/auth.validation");
const { sendOtpSchema, verifyOtpSchema } = require("../validators/otp.validation");

const { registerProviderSchema: doctorSchema } = require("../validators/doctor.validation");
const { registerPharmacistSchema } = require("../validators/pharmacist.validation");
const { registerProfessionalCaregiverSchema } = require("../validators/professionalCaregiver.validation");
const { registerEmailSchema: patientEmailSchema, registerPhoneSchema: patientPhoneSchema } = require("../validators/patient.validation");
const { registerEmailSchema: familyEmailSchema, registerPhoneSchema: familyPhoneSchema } = require("../validators/familyCaregiver.validation");
const { registerProfessionalSchema, registerProviderSchema: adminRegisterProviderSchema, updateAccountStatusSchema } = require("../validators/admin.validation");

const emailSchemas = { PATIENT: patientEmailSchema, FAMILY_CAREGIVER: familyEmailSchema };
const phoneSchemas = { PATIENT: patientPhoneSchema, FAMILY_CAREGIVER: familyPhoneSchema };
const providerSchemas = { DOCTOR: doctorSchema, PHARMACIST: registerPharmacistSchema, PROFESSIONAL_CAREGIVER: registerProfessionalCaregiverSchema };

// Public routes
router.post("/login", validate(loginSchema), authController.login);
router.post("/token/refresh", authController.refreshSession);

// OTP routes (require authentication — user must be logged in to send/verify OTP)
router.post("/otp/send", authenticate, validate(sendOtpSchema), otpController.sendOtp);
router.post("/otp/verify", authenticate, validate(verifyOtpSchema), otpController.verifyOtp);

// Authenticated routes
router.post("/logout", authenticate, authController.logout);

// Self-registration routes
router.post("/register/email", validateByRole(emailSchemas), authController.registerEmail);
router.post("/register/phone", validateByRole(phoneSchemas), authController.registerPhone);
router.post("/register/provider", validateByRole(providerSchemas), authController.registerProvider);

// Admin-only routes (5 endpoints)
router.use("/admin", authenticate, authorize("ADMIN"));
router.post("/admin/register/professional", validate(registerProfessionalSchema), adminController.registerProfessional);
router.post("/admin/register/provider", validate(adminRegisterProviderSchema), adminController.registerProvider);
router.patch("/admin/verify/doctor/:id", adminController.verifyDoctor);
router.patch("/admin/verify/pharmacist/:id", adminController.verifyPharmacist);
router.patch("/admin/accounts/:id/status", validate(updateAccountStatusSchema), adminController.updateAccountStatus);

module.exports = router;
