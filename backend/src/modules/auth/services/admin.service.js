const Account = require("../models/Account.model");
const Admin = require("../models/Admin.model");
const Doctor = require("../models/Doctor.model");
const Pharmacist = require("../models/Pharmacist.model");
const ProfessionalCaregiver = require("../models/ProfessionalCaregiver.model");
const { _verifyUniqueness } = require("../utiltis/auth.utils");
const AppError = require("../../../shared/utils/AppError");
const { logger } = require("../../../shared/utils/logger");
const ServiceResponse = require("../../../shared/utils/ServiceResponse");

const MODEL_MAP = { DOCTOR: Doctor, PHARMACIST: Pharmacist, PROFESSIONAL_CAREGIVER: ProfessionalCaregiver };

class AdminService {
  async _requireAdmin(accountId, requiredPermission = null) {
    const adminProfile = await Admin.findOne({ accountId });
    if (!adminProfile) throw new AppError("Admin profile not found", 404, "ADMIN_NOT_FOUND", { en: "Admin not found.", ar: "المسؤول غير موجود." });
    if (adminProfile.adminType === "super_admin") return adminProfile;
    if (requiredPermission) {
      const has = adminProfile.permissions && (adminProfile.permissions.includes("*") || adminProfile.permissions.includes(requiredPermission));
      if (!has) throw new AppError("Insufficient admin permissions", 403, "FORBIDDEN", { en: "Insufficient permissions.", ar: "صلاحيات غير كافية." });
    }
    return adminProfile;
  }

  async registerProfessional(adminAccountId, userData) {
    await this._requireAdmin(adminAccountId, "users.create");
    await _verifyUniqueness({ email: userData.email, phone: userData.phone });
    const account = new Account({ email: userData.email, phone: userData.phone, nationalNumber: userData.nationalNumber, passwordHash: userData.password, role: "PROFESSIONAL_CAREGIVER", isActive: true, isEmailVerified: true, isPhoneVerified: true, sessions: [] });
    await account.save();
    const profile = new ProfessionalCaregiver({ accountId: account._id, firstName: userData.firstName, lastName: userData.lastName, licenseNumber: userData.licenseNumber, specialization: userData.specialization, isVerified: true, hourlyRate: userData.hourlyRate || 0, whatsappOptIn: userData.whatsappOptIn ?? false, preferredLanguage: userData.preferredLanguage || "ar" });
    await profile.save();
    logger.info(`[AdminAction] Admin ${adminAccountId} created PROFESSIONAL_CAREGIVER ${account._id}`);
    return new ServiceResponse({ status: "CREATED", en: "Professional caregiver created.", ar: "تم إنشاء مقدم الرعاية.", data: { accountId: account._id, profileId: profile._id, role: account.role, isVerified: profile.isVerified, isActive: account.isActive } });
  }

  async registerProvider(adminAccountId, userData) {
    await this._requireAdmin(adminAccountId, "users.create");
    const { role } = userData;
    if (!["DOCTOR", "PHARMACIST"].includes(role)) throw new AppError("Invalid provider role", 400, "INVALID_ROLE", { en: "Role must be DOCTOR or PHARMACIST.", ar: "الدور يجب أن يكون DOCTOR أو PHARMACIST." });
    await _verifyUniqueness({ email: userData.email, phone: userData.phone });
    const account = new Account({ email: userData.email, phone: userData.phone, nationalNumber: userData.nationalNumber, passwordHash: userData.password, role, isActive: true, isEmailVerified: true, isPhoneVerified: true, sessions: [] });
    await account.save();
    const TargetModel = MODEL_MAP[role];
    const profileData = this._buildProviderProfileData(role, userData);
    const profile = new TargetModel({ accountId: account._id, ...profileData, isVerified: true });
    await profile.save();
    logger.info(`[AdminAction] Admin ${adminAccountId} created ${role} ${account._id}`);
    return new ServiceResponse({ status: "CREATED", en: `${role} account created.`, ar: `تم إنشاء حساب ${role}.`, data: { accountId: account._id, profileId: profile._id, role: account.role, isVerified: profile.isVerified, isActive: account.isActive } });
  }

  _buildProviderProfileData(role, userData) {
    const common = { firstName: userData.firstName, lastName: userData.lastName, whatsappOptIn: userData.whatsappOptIn ?? false, preferredLanguage: userData.preferredLanguage || "ar" };
    if (role === "DOCTOR") {
      const data = { ...common, specialty: userData.specialty, syndicateId: userData.syndicateId, clinicName: userData.clinicName, clinicAddress: userData.clinicAddress || {} };
      if (userData.coordinates && Array.isArray(userData.coordinates) && userData.coordinates.length === 2) data.location = { type: "Point", coordinates: userData.coordinates };
      return data;
    }
    if (role === "PHARMACIST") {
      const data = { ...common, pharmacyName: userData.pharmacyName, ownerName: userData.ownerName || `${userData.firstName} ${userData.lastName}`, licenseNumber: userData.licenseNumber, address: userData.address || {} };
      if (userData.coordinates && Array.isArray(userData.coordinates) && userData.coordinates.length === 2) data.location = { type: "Point", coordinates: userData.coordinates };
      return data;
    }
    return common;
  }

  async verifyDoctor(adminAccountId, doctorProfileId) {
    const adminProfile = await this._requireAdmin(adminAccountId, "users.verify");
    const doctor = await Doctor.findById(doctorProfileId);
    if (!doctor) throw new AppError("Doctor not found", 404, "DOCTOR_NOT_FOUND", { en: "Doctor not found.", ar: "الطبيب غير موجود." });
    if (doctor.isVerified) throw new AppError("Already verified", 400, "ALREADY_VERIFIED", { en: "Already verified.", ar: "تم التحقق بالفعل." });
    doctor.isVerified = true;
    await doctor.save();
    await Account.findByIdAndUpdate(doctor.accountId, { isActive: true });
    logger.info(`[AdminAction] Admin ${adminAccountId} verified Doctor ${doctor._id}`);
    return new ServiceResponse({ status: "SUCCESS", en: "Doctor verified.", ar: "تم التحقق من الطبيب.", data: { profileId: doctor._id, accountId: doctor.accountId, isVerified: doctor.isVerified, verifiedBy: adminProfile._id } });
  }

  async verifyPharmacist(adminAccountId, pharmacistProfileId) {
    const adminProfile = await this._requireAdmin(adminAccountId, "users.verify");
    const pharmacist = await Pharmacist.findById(pharmacistProfileId);
    if (!pharmacist) throw new AppError("Pharmacist not found", 404, "PHARMACIST_NOT_FOUND", { en: "Pharmacist not found.", ar: "الصيدلي غير موجود." });
    if (pharmacist.subscription && pharmacist.subscription.status === "active") throw new AppError("Already verified", 400, "ALREADY_VERIFIED", { en: "Already verified.", ar: "تم التحقق بالفعل." });
    if (!pharmacist.subscription) pharmacist.subscription = {};
    pharmacist.subscription.status = "active";
    pharmacist.subscription.startDate = new Date();
    await pharmacist.save();
    await Account.findByIdAndUpdate(pharmacist.accountId, { isActive: true });
    logger.info(`[AdminAction] Admin ${adminAccountId} verified Pharmacist ${pharmacist._id}`);
    return new ServiceResponse({ status: "SUCCESS", en: "Pharmacist verified.", ar: "تم التحقق من الصيدلي.", data: { profileId: pharmacist._id, accountId: pharmacist.accountId, subscriptionStatus: pharmacist.subscription.status, verifiedBy: adminProfile._id } });
  }

  async updateAccountStatus(adminAccountId, targetAccountId, isActive, reason = null) {
    const adminProfile = await this._requireAdmin(adminAccountId, "users.manage");
    if (targetAccountId.toString() === adminAccountId.toString()) throw new AppError("Cannot modify own account", 400, "INVALID_OPERATION", { en: "Cannot modify own account.", ar: "لا يمكن تعديل حسابك." });
    const account = await Account.findById(targetAccountId);
    if (!account) throw new AppError("Account not found", 404, "ACCOUNT_NOT_FOUND", { en: "Account not found.", ar: "الحساب غير موجود." });
    if (account.role === "ADMIN" && adminProfile.adminType !== "super_admin") throw new AppError("Cannot modify admin accounts", 403, "FORBIDDEN", { en: "Only super admins can modify admins.", ar: "فقط المسؤول الأعلى يمكنه تعديل المسؤولين." });
    const previousStatus = account.isActive;
    account.isActive = isActive;
    if (!isActive) account.sessions = [];
    await account.save();
    logger.info(`[AdminAction] Admin ${adminAccountId} set account ${targetAccountId} isActive=${isActive}`);
    return new ServiceResponse({ status: "SUCCESS", en: `Account ${isActive ? "activated" : "deactivated"}.`, ar: `تم ${isActive ? "تفعيل" : "تعطيل"} الحساب.`, data: { accountId: account._id, role: account.role, previousStatus, currentStatus: account.isActive, reason, modifiedBy: adminProfile._id } });
  }
}
module.exports = new AdminService();
