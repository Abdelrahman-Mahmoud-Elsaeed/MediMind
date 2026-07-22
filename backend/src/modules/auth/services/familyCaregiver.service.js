const Account = require("../models/Account.model");
const FamilyCaregiver = require("../models/FamilyCaregiver.model");
const { _verifyUniqueness, _finalizeSession } = require("../utiltis/auth.utils");
const ServiceResponse = require("../../../shared/utils/ServiceResponse");

class FamilyCaregiverService {
  async registerEmail(userData) {
    await _verifyUniqueness({ email: userData.email });
    const account = new Account({ email: userData.email, passwordHash: userData.password, role: "FAMILY_CAREGIVER", isActive: true, sessions: [] });
    await account.save();
    const profile = this._createProfileInstance(FamilyCaregiver, account._id, userData);
    await profile.save();
    const sessionData = await _finalizeSession(account, profile);
    return new ServiceResponse({ status: "SUCCESS", en: "Registration successful.", ar: "تم التسجيل بنجاح.", data: sessionData });
  }

  async registerPhone(userData) {
    await _verifyUniqueness({ phone: userData.phone });
    const account = new Account({ phone: userData.phone, nationalNumber: userData.nationalNumber, passwordHash: userData.password, role: "FAMILY_CAREGIVER", isActive: true, sessions: [] });
    await account.save();
    const profile = this._createProfileInstance(FamilyCaregiver, account._id, userData);
    await profile.save();
    const sessionData = await _finalizeSession(account, profile);
    return new ServiceResponse({ status: "SUCCESS", en: "Registration successful.", ar: "تم التسجيل بنجاح.", data: sessionData });
  }

  _createProfileInstance(Model, accountId, profileData) {
    const { firstName, lastName, dateOfBirth, gender, bloodType, height, weight, profilePictureUrl, address, emergencyContact, allergies, whatsappOptIn, preferredLanguage, consents, relation, subscription, alertSettings, ...extraFields } = profileData;
    return new Model({ accountId, firstName, lastName, whatsappOptIn, preferredLanguage, relation, subscription: subscription || { plan: "free" }, alertSettings: alertSettings || { instantMissed: true, weeklyReport: true, monthlyReport: false }, ...extraFields });
  }
}
module.exports = new FamilyCaregiverService();
