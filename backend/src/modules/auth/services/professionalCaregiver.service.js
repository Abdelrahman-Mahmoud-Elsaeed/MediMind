const Account = require("../models/Account.model");
const ProfessionalCaregiver = require("../models/ProfessionalCaregiver.model");
const { _verifyUniqueness } = require("../utiltis/auth.utils");
const ServiceResponse = require("../../../shared/utils/ServiceResponse");

class ProfessionalCaregiverService {
  async registerProvider(userData) {
    await _verifyUniqueness({ email: userData.email, phone: userData.phone });
    const account = new Account({ email: userData.email, phone: userData.phone, nationalNumber: userData.nationalNumber, passwordHash: userData.password, role: "PROFESSIONAL_CAREGIVER", isActive: false, sessions: [] });
    await account.save();
    const { firstName, lastName, licenseNumber, specialization, whatsappOptIn, preferredLanguage, ...extra } = userData;
    const profile = new ProfessionalCaregiver({ accountId: account._id, firstName, lastName, licenseNumber, specialization, whatsappOptIn, preferredLanguage, ...extra });
    await profile.save();
    return new ServiceResponse({ status: "PENDING_VERIFICATION", en: "Registration pending verification.", ar: "التسجيل قيد التحقق.", data: { accountId: account._id, role: account.role, profileId: profile._id } });
  }
}
module.exports = new ProfessionalCaregiverService();
