const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const validateByRole = require("../../../shared/middleware/validateByRole.middleware");

const { registerProviderSchema: doctorSchema } = require("../validators/doctor.validation");
const { registerPharmacistSchema } = require("../validators/pharmacist.validation");
const { registerProfessionalCaregiverSchema } = require("../validators/professionalCaregiver.validation");

const { registerEmailSchema: patientEmailSchema, registerPhoneSchema: patientPhoneSchema } = require("../validators/patient.validation");
const { registerEmailSchema: familyEmailSchema, registerPhoneSchema: familyPhoneSchema } = require("../validators/familyCaregiver.validation");


const emailSchemas = {
  PATIENT: patientEmailSchema,
  FAMILY_CAREGIVER: familyEmailSchema,
};

const phoneSchemas = {
  PATIENT: patientPhoneSchema,
  FAMILY_CAREGIVER: familyPhoneSchema,
};

const providerSchemas = {
  DOCTOR: doctorSchema,
  PHARMACIST: registerPharmacistSchema,
  PROFESSIONAL_CAREGIVER: registerProfessionalCaregiverSchema,
};


router.post("/login", authController.login);
router.post("/token/refresh", authController.refreshSession);
router.post("/logout", authController.logout);


router.post("/register/email", validateByRole(emailSchemas), authController.registerEmail);
router.post("/register/phone", validateByRole(phoneSchemas), authController.registerPhone);
router.post("/register/provider", validateByRole(providerSchemas), authController.registerProvider);



module.exports = router;