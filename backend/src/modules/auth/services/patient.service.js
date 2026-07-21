const Account = require("../models/Account.model");
const Patient = require("../models/Patient.model");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../../../shared/utils/jwt.util");
const { logger } = require("../../../shared/utils/logger");
const AppError = require("../../../shared/utils/AppError");
const mongoose = require("mongoose");
const {
  _verifyUniqueness,
  _finalizeSession,
} = require("../utils/auth.utils");
const ServiceResponse = require("../../../shared/utils/ServiceResponse");

class PatientService {
  async registerEmail(userData) {
    const { credentials, phone, nationalNumber, role } = userData;
    let account;
    let profile;

    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      await _verifyUniqueness(
        {
          email: credentials.email,
          phone,
        },
        session,
      );

      account = new Account({
        email: credentials.email,
        ...(phone ? { phone } : {}),
        ...(nationalNumber ? { nationalNumber } : {}),
        passwordHash: credentials.password,
        role: role || "PATIENT",
        isActive: true,
        sessions: [],
      });
      await account.save({ session });

      profile = this._createProfileInstance(Patient, account._id, userData);
      await profile.save({ session });
    });
    session.endSession();

    const sessionData = await _finalizeSession(account, profile);

    return new ServiceResponse({
      status: "SUCCESS",
      en: "Registration completed successfully.",
      ar: "تمت عملية التسجيل بنجاح.",
      data: sessionData,
    });
  }

  async registerPhone(userData) {
    const { credentials, email, nationalNumber, role } = userData;
    let account;
    let profile;

    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      await _verifyUniqueness(
        {
          phone: credentials.phone,
          email,
        },
        session,
      );

      account = new Account({
        phone: credentials.phone,
        ...(email ? { email } : {}),
        ...(nationalNumber ? { nationalNumber } : {}),
        passwordHash: credentials.password,
        role: role || "PATIENT",
        isActive: true,
        sessions: [],
      });
      await account.save({ session });

      profile = this._createProfileInstance(Patient, account._id, userData);
      await profile.save({ session });
    });
    session.endSession();

    const sessionData = await _finalizeSession(account, profile);

    return new ServiceResponse({
      status: "SUCCESS",
      en: "Registration completed successfully.",
      ar: "تمت عملية التسجيل بنجاح.",
      data: sessionData,
    });
  }

  _createProfileInstance(Model, accountId, profileData) {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      bloodType,
      height,
      weight,
      profilePictureUrl,
      address,
      emergencyContact,
      allergies,
      whatsappOptIn,
      preferredLanguage,
      consents,
      ...extraFields // Captures any extra fields specific to other roles
    } = profileData;

    return new Model({
      accountId: accountId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      bloodType,
      height,
      weight,
      profilePictureUrl,
      address: address || [],
      emergencyContact: emergencyContact || [],
      allergies: allergies || [],
      whatsappOptIn: whatsappOptIn ?? false,
      preferredLanguage: preferredLanguage || "ar",
      consents: consents || {
        familyCaregiver: false,
        professionalCaregiver: false,
        doctor: false,
        pharmacy: false,
      },
      ...extraFields,
    });
  }
}

module.exports = new PatientService();
