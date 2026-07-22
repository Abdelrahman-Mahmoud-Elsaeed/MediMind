const Account = require("../models/Account.model");
const Pharmacist = require("../models/Pharmacist.model");
const { _verifyUniqueness } = require("../utiltis/auth.utils");
const ServiceResponse = require("../../../shared/utils/ServiceResponse");

class PharmacistService {
  async registerProvider(userData) {
    await _verifyUniqueness({ email: userData.email, phone: userData.phone });
    const account = new Account({ email: userData.email, phone: userData.phone, nationalNumber: userData.nationalNumber, passwordHash: userData.password, role: "PHARMACIST", isActive: false, sessions: [] });
    await account.save();
    const { firstName, lastName, whatsappOptIn, preferredLanguage, pharmacyName, ownerName, licenseNumber, providerAddress, location, ...extra } = userData;
    const profile = new Pharmacist({ accountId: account._id, whatsappOptIn, preferredLanguage, ...(firstName && { firstName }), ...(lastName && { lastName }), ...(pharmacyName !== undefined && { pharmacyName }), ...(ownerName !== undefined && { ownerName }), ...(licenseNumber !== undefined && { licenseNumber }), ...(providerAddress && { address: providerAddress }), location: location || null, ...extra });
    await profile.save();
    return new ServiceResponse({ status: "PENDING_VERIFICATION", en: "Registration pending verification.", ar: "التسجيل قيد التحقق.", data: { accountId: account._id, role: account.role, profileId: profile._id } });
  }
}
module.exports = new PharmacistService();
