const Account = require("../models/Account.model");
const Doctor = require("../models/Doctor.model");
const { _verifyUniqueness } = require("../utiltis/auth.utils");
const ServiceResponse = require("../../../shared/utils/ServiceResponse");

class DoctorService {
  async registerProvider(userData) {
    await _verifyUniqueness({ email: userData.email, phone: userData.phone });
    const account = new Account({
      email: userData.email, phone: userData.phone,
      nationalNumber: userData.nationalNumber,
      passwordHash: userData.password, role: "DOCTOR", isActive: false, sessions: []
    });
    await account.save();
    
    // The validator renames syndicateId → licenseNumber and governorate/city/street → providerAddress
    const profile = new Doctor({
      accountId: account._id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      specialty: userData.specialty,
      syndicateId: userData.licenseNumber || userData.syndicateId,  // validator renames syndicateId → licenseNumber
      clinicName: userData.clinicName,
      clinicAddress: userData.providerAddress || userData.clinicAddress || {},
      location: userData.location || null,
      whatsappOptIn: userData.whatsappOptIn,
      preferredLanguage: userData.preferredLanguage,
    });
    await profile.save();
    
    return new ServiceResponse({
      status: "PENDING_VERIFICATION",
      en: "Registration pending verification.",
      ar: "التسجيل قيد التحقق.",
      data: { accountId: account._id, role: account.role, profileId: profile._id }
    });
  }
}
module.exports = new DoctorService();
