const Doctor = require('../../auth/models/Doctor.model');
const Patient = require('../../auth/models/Patient.model');
const DoseEvent = require('../../doses/models/DoseEvent.model');
const Medication = require('../../medications/models/Medication.model');
const AppError = require('../../../shared/utils/AppError');

class DoctorService {
  async _getDoctorProfile(accountId) {
    const doctor = await Doctor.findOne({ accountId });
    if (!doctor) throw new AppError('Doctor profile not found', 404, 'DOCTOR_NOT_FOUND', { en: 'Not found.', ar: 'غير موجود.' });
    return doctor;
  }

  // List patients (linked to this doctor via relationships or all if super_admin)
  async getPatients(accountId) {
    const doctor = await this._getDoctorProfile(accountId);
    // For now, return all patients (in production, filter by doctor-patient relationship)
    const patients = await Patient.find().select('firstName lastName gender preferredLanguage consents').lean();
    return patients;
  }

  // Get compliance rate for a specific patient
  async getPatientCompliance(accountId, patientId) {
    const doctor = await this._getDoctorProfile(accountId);
    const patient = await Patient.findById(patientId).lean();
    if (!patient) throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND', { en: 'Not found.', ar: 'غير موجود.' });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const doses = await DoseEvent.find({
      patientId,
      scheduledFor: { $gte: thirtyDaysAgo },
    }).lean();

    const total = doses.length;
    const taken = doses.filter(d => d.status === 'TAKEN').length;
    const missed = doses.filter(d => d.status === 'MISSED').length;
    const skipped = doses.filter(d => d.status === 'SKIPPED').length;
    const pending = doses.filter(d => d.status === 'PENDING').length;

    return {
      patientId,
      patientName: `${patient.firstName} ${patient.lastName}`,
      period: '30 days',
      totalDoses: total,
      takenDoses: taken,
      missedDoses: missed,
      skippedDoses: skipped,
      pendingDoses: pending,
      complianceRate: total > 0 ? Math.round((taken / total) * 100) : 0,
    };
  }

  // Weekly report (for WhatsApp)
  async getWeeklyReport(accountId) {
    const doctor = await this._getDoctorProfile(accountId);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get all patients with their dose stats
    const patients = await Patient.find().select('firstName lastName').lean();
    const report = [];

    for (const patient of patients) {
      const doses = await DoseEvent.find({
        patientId: patient._id,
        scheduledFor: { $gte: sevenDaysAgo },
      }).lean();

      const total = doses.length;
      const taken = doses.filter(d => d.status === 'TAKEN').length;
      const missed = doses.filter(d => d.status === 'MISSED').length;

      if (total > 0) {
        report.push({
          patientId: patient._id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          totalDoses: total,
          takenDoses: taken,
          missedDoses: missed,
          complianceRate: Math.round((taken / total) * 100),
        });
      }
    }

    // Sort by worst compliance first
    report.sort((a, b) => a.complianceRate - b.complianceRate);

    return {
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      period: '7 days',
      totalPatients: report.length,
      compliantPatients: report.filter(r => r.complianceRate >= 80).length,
      nonCompliantPatients: report.filter(r => r.complianceRate < 80),
      allPatients: report,
    };
  }
}

module.exports = new DoctorService();
