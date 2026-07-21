const Account = require("../models/Account.model");
const Pharmacist = require("../models/Pharmacist.model");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../../../shared/utils/jwt.util");
const { logger } = require("../../../shared/utils/logger");
const AppError = require("../../../shared/utils/AppError");
const mongoose = require("mongoose");
const { _verifyUniqueness } = require("../utils/auth.utils");
const ServiceResponse = require("../../../shared/utils/ServiceResponse");

class PharmacistService {
  async registerProvider(userData) {
    const { credentials, email, phone, nationalNumber, licenseNumber, role } =
      userData;
    let account;
    let profile;

    const primaryEmail = credentials?.email || email;
    const primaryPhone = credentials?.phone || phone;
    const password = credentials?.password || userData.password;

    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      await _verifyUniqueness(
        {
          email: primaryEmail,
          phone: primaryPhone,
          license: licenseNumber,
        },
        session,
      );

      account = new Account({
        email: primaryEmail || null,
        phone: primaryPhone || null,
        nationalNumber: nationalNumber || null,
        passwordHash: password,
        role: role || "PHARMACIST",
        isActive: false,
        sessions: [],
      });
      await account.save({ session });

      profile = this._createProfileInstance(Pharmacist, account._id, userData);
      await profile.save({ session });
    });
    session.endSession();

    const isEmailVerified = account.isEmailVerified || false;
    const isPhoneVerified = account.isPhoneVerified || false;
    const isVerified =
      isEmailVerified || isPhoneVerified || profile?.isVerified === true;

    return new ServiceResponse({
      status: "PENDING_VERIFICATION",
      en: "Registration complete. Please wait while we verify your medical license.",
      ar: "تمت عملية التسجيل. يرجى الانتظار لحين التحقق من ترخيصك الطبي.",
      data: {
        accountId: account._id,
        role: account.role,
        profileId: profile._id,
        isEmailVerified,
        isPhoneVerified,
        isVerified,
      },
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
      pharmacyName,
      ownerName,
      licenseNumber,
      providerAddress,
      location,
      ...extraFields
    } = userData;

    return new Model({
      accountId,
      whatsappOptIn,
      preferredLanguage,
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(relation && { relation }),
      ...(subscription && { subscription }),
      ...(alertSettings && { alertSettings }),
      ...(pharmacyName !== undefined && { pharmacyName }),
      ...(ownerName !== undefined && { ownerName }),
      ...(licenseNumber !== undefined && { licenseNumber }),
      ...(providerAddress && { address: providerAddress }),
      location: location || null,
      ...extraFields,
    });
  }
}

module.exports = new PharmacistService();
