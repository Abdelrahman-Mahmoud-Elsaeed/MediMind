const Pharmacist = require('../../auth/models/Pharmacist.model');
const Patient = require('../../auth/models/Patient.model');
const Medication = require('../../medications/models/Medication.model');
const Account = require('../../auth/models/Account.model');
const DoseEvent = require('../../doses/models/DoseEvent.model');
const AppError = require('../../../shared/utils/AppError');

class PharmacyService {
  async _getPharmacistProfile(accountId) {
    const pharmacist = await Pharmacist.findOne({ accountId });
    if (!pharmacist) throw new AppError('Pharmacist profile not found', 404, 'PHARMACIST_NOT_FOUND', { en: 'Not found.', ar: 'غير موجود.' });
    return pharmacist;
  }

  // List all patients linked to this pharmacy
  async getPatients(accountId) {
    const pharmacist = await this._getPharmacistProfile(accountId);
    // Find patients whose medications have this pharmacy linked
    // (In the current schema, medications don't have a pharmacyId — we use the medication's patientId)
    // For now, return patients who have active medications
    const medications = await Medication.find({ isActive: true }).distinct('patientId');
    const patients = await Patient.find({ _id: { $in: medications } }).select('firstName lastName gender preferredLanguage').lean();
    return patients;
  }

  // Patients whose medications will run out soon
  async getRefillSoon(accountId) {
    const pharmacist = await this._getPharmacistProfile(accountId);
    const lowStockMeds = await Medication.find({
      isActive: true,
      $expr: { $lte: ['$inventory.currentQuantity', '$inventory.refillThreshold'] },
    }).populate('patientId', 'firstName lastName phone').lean();

    return lowStockMeds.map(med => ({
      medicationId: med._id,
      name: med.name,
      formType: med.formType,
      currentQuantity: med.inventory.currentQuantity,
      refillThreshold: med.inventory.refillThreshold,
      doseAmount: med.inventory.doseAmount,
      patient: med.patientId,
    }));
  }

  // Pharmacy analytics
  async getAnalytics(accountId) {
    const pharmacist = await this._getPharmacistProfile(accountId);
    const meds = await Medication.find({ isActive: true }).lean();
    const totalPatients = await Patient.countDocuments();
    const lowStockCount = meds.filter(m => m.inventory.currentQuantity <= m.inventory.refillThreshold).length;
    const totalMedications = meds.length;

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentDoses = await DoseEvent.countDocuments({ takenAt: { $gte: sevenDaysAgo } });

    return {
      totalPatients,
      totalMedications,
      lowStockCount,
      refillsNeeded: lowStockCount,
      recentDoseConfirmations: recentDoses,
      subscriptionStatus: pharmacist.subscription?.status || 'pilot',
    };
  }

  // Send refill reminder to a patient
  async sendRefillReminder(accountId, patientId) {
    const pharmacist = await this._getPharmacistProfile(accountId);
    const patient = await Patient.findById(patientId).lean();
    if (!patient) throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND', { en: 'Not found.', ar: 'غير موجود.' });

    // In production, this would send an FCM notification + SMS
    return { success: true, patientId, message: 'Refill reminder sent' };
  }
}

module.exports = new PharmacyService();
