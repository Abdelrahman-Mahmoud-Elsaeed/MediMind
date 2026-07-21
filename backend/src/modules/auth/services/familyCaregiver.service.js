const Account = require("../models/Account.model");
const FamilyCaregiver = require("../models/FamilyCaregiver.model");
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

class FamilyCaregiverService {

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
        role: role || "FAMILY_CAREGIVER",
        isActive: true,
        sessions: [],
      });
      await account.save({ session });

      profile = this._createProfileInstance(
        FamilyCaregiver,
        account._id,
        userData,
      );
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
      // Check uniqueness for primary phone and optional email
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
        role: role || "FAMILY_CAREGIVER",
        isActive: true,
        sessions: [],
      });
      await account.save({ session });

      profile = this._createProfileInstance(
        FamilyCaregiver,
        account._id,
        userData,
      );
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

  _createProfileInstance(Model, accountId, userData) {
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
      relation,
      subscription,
      alertSettings,
      ...extraFields
    } = userData;

    return new Model({
      accountId,
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
      relation,
      subscription: subscription || { plan: "free" },
      alertSettings: alertSettings || {
        instantMissed: true,
        weeklyReport: true,
        monthlyReport: false,
      },
      ...extraFields,
    });
  }
}

module.exports = new FamilyCaregiverService();
