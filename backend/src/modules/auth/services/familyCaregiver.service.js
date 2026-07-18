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
} = require("../utiltis/auth.utils");
const ServiceResponse = require("../../../shared/utils/ServiceResponse");

class FamilyCaregiverService {
  
  async registerEmail(userData) {

    let account;
    let profile;

    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      await _verifyUniqueness(
        { email: userData.email },
        session,
      );

      account = new Account({
        email: userData.email,
        passwordHash: userData.password,
        role: "FAMILY_CAREGIVER",
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

    // 2. Finalize session token object structure
    const sessionData = await _finalizeSession(account, profile);

    // 3. Wrap output inside your unified global ServiceResponse template instance
    return new ServiceResponse({
      status: "SUCCESS",
      en: "Registration completed successfully.",
      ar: "تمت عملية التسجيل بنجاح.",
      data: sessionData
    });
  }

  async registerPhone(userData) {

    let account;
    let profile;

    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      await _verifyUniqueness(
        { phone: userData.phone },
        session,
      );

      account = new Account({
        phone: userData.phone,
        passwordHash: userData.password,
        nationalNumber: userData.nationalNumber,
        role: "FAMILY_CAREGIVER",
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
      data: sessionData
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