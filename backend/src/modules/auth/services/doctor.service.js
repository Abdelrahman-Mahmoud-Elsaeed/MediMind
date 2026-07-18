const Account = require("../models/Account.model");
const Doctor = require("../models/Doctor.model");
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
  _finalizeSession,
  _verifyUniqueness,
} = require("../utiltis/auth.utils");
const ServiceResponse = require("../../../shared/utils/ServiceResponse");

class DoctorService {
  
  async registerProvider(userData) {

    let account;
    let profile;

    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      await _verifyUniqueness(
        {
          email: userData.email,
          phone: userData.phone,
          license: userData.licenseNumber,
        },
        session,
      );

      account = new Account({
        email: userData.email,
        phone: userData.phone,
        nationalNumber: userData.nationalNumber,
        passwordHash: userData.password,
        role: "DOCTOR",
        isActive: false,
        sessions: [],
      });
      await account.save({ session });

      profile = this._createProfileInstance(Doctor, account._id, userData);
      await profile.save({ session });
    });
    session.endSession();
    
    const isEmailVerified = account.isEmailVerified || false;
    const isPhoneVerified = account.isPhoneVerified || false;
    const isVerified = isEmailVerified || isPhoneVerified || profile?.isVerified === true;

    // 2. Wrap the final payload within the unified global ServiceResponse template instance
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
      pharmacyName,
      ownerName,
      providerAddress,
      location,
      addedByAdminId,
      hourlyRate,
      bio,
      isAvailable,
      specialties,
      skills,
      experienceYears,
      licenseNumber,
      alternativePhone,
      alertSettings,
      // Extract unique doctor elements
      specialty,
      clinicName,
      ...extraFields
    } = userData;

    return new Model({
      accountId,
      firstName,
      lastName,
      profilePictureUrl,
      whatsappOptIn,
      preferredLanguage,
      // Assign Doctor configurations dynamically
      ...(specialty !== undefined && { specialty }),
      ...(clinicName !== undefined && { clinicName }),
      ...(licenseNumber !== undefined && { syndicateId: licenseNumber }),

      // Safety pass-throughs for structural shared endpoints
      ...(addedByAdminId && { addedByAdminId }),
      ...(hourlyRate !== undefined && { hourlyRate }),
      ...(bio !== undefined && { bio }),
      ...(isAvailable !== undefined && { isAvailable }),
      ...(specialties && { specialties }),
      ...(skills && { skills }),
      ...(experienceYears !== undefined && { experienceYears }),
      ...(alternativePhone && { alternativePhone }),
      ...(alertSettings && { alertSettings }),
      ...(relation && { relation }),
      ...(subscription && { subscription }),
      ...(pharmacyName !== undefined && { pharmacyName }),
      ...(ownerName !== undefined && { ownerName }),
      ...(providerAddress && { address: providerAddress }),
      ...(location !== undefined && { location }),
      ...extraFields,
    });
  }
}

module.exports = new DoctorService();