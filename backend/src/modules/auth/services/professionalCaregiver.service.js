const mongoose = require("mongoose");
const Account = require("../models/Account.model");
const ProfessionalCaregiver = require("../models/ProfessionalCaregiver.model");
const ServiceResponse = require("../../../shared/utils/ServiceResponse");
const { _verifyUniqueness } = require("../utiltis/auth.utils");

class ProfessionalCaregiverService {

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
        role: "PROFESSIONAL_CAREGIVER",
        isActive: false,
        sessions: [],
      });
      await account.save({ session });

      profile = this._createProfileInstance(
        ProfessionalCaregiver,
        account._id,
        userData,
      );
      await profile.save({ session });
    });
    session.endSession();

    const isEmailVerified = account.isEmailVerified || false;
    const isPhoneVerified = account.isPhoneVerified || false;
    const isVerified = isEmailVerified || isPhoneVerified || profile?.isVerified === true;

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
      ...extraFields
    } = userData;

    return new Model({
      accountId,
      firstName,
      lastName,
      profilePictureUrl,
      whatsappOptIn,
      preferredLanguage,

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
      address: providerAddress,
      location: location || null,
      ...extraFields,
    });
  }

}

module.exports = new ProfessionalCaregiverService();
