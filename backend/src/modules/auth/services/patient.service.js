const Account = require("../models/Account.model");
const Patient = require("../models/Patient.model");
const { _verifyUniqueness, _finalizeSession } = require("../utiltis/auth.utils");
const AppError = require("../../../shared/utils/AppError");
const ServiceResponse = require("../../../shared/utils/ServiceResponse");

class PatientService {
  async registerEmail(userData) {
    await _verifyUniqueness({ email: userData.email });
    const account = new Account({ email: userData.email, passwordHash: userData.password, role: "PATIENT", isActive: true, sessions: [] });
    await account.save();
    const profile = this._createProfileInstance(Patient, account._id, userData);
    await profile.save();
    const sessionData = await _finalizeSession(account, profile);
    return new ServiceResponse({ status: "SUCCESS", en: "Registration successful.", ar: "تم التسجيل بنجاح.", data: sessionData });
  }

  async registerPhone(userData) {
    await _verifyUniqueness({ phone: userData.phone });
    const account = new Account({ phone: userData.phone, nationalNumber: userData.nationalNumber, passwordHash: userData.password, role: "PATIENT", isActive: true, sessions: [] });
    await account.save();
    const profile = this._createProfileInstance(Patient, account._id, userData);
    await profile.save();
    const sessionData = await _finalizeSession(account, profile);
    return new ServiceResponse({ status: "SUCCESS", en: "Registration successful.", ar: "تم التسجيل بنجاح.", data: sessionData });
  }

  _createProfileInstance(Model, accountId, profileData) {
    const { firstName, lastName, dateOfBirth, gender, bloodType, height, weight, profilePictureUrl, address, emergencyContact, allergies, whatsappOptIn, preferredLanguage, consents, alarmSettings, ...extraFields } = profileData;
    return new Model({ accountId, firstName, lastName, dateOfBirth, gender, bloodType, height, weight, profilePictureUrl, address: address || [], emergencyContact: emergencyContact || [], allergies: allergies || [], whatsappOptIn: whatsappOptIn ?? false, preferredLanguage: preferredLanguage || "ar", consents: consents || { familyCaregiver: false, professionalCaregiver: false, doctor: false, pharmacy: false }, alarmSettings: alarmSettings || undefined, ...extraFields });
  }
}
module.exports = new PatientService();
