const Doctor = require('../../auth/models/Doctor.model');
const Patient = require('../../auth/models/Patient.model');
const Medication = require('../../medications/models/Medication.model');
const DoseEvent = require('../../doses/models/DoseEvent.model');
const { logger } = require('../../../sheared/utils/logger');

/**
 * Doctor Service — وفاء (Wafa)
 *
 * Most doctors prefer weekly WhatsApp reports over a dashboard.
 * This service provides both:
 *  1. Generates the weekly report data (used by worker)
 *  2. Provides dashboard data for doctors who want deeper insights
 */
class DoctorService {

  /**
   * Get the doctor profile for the current account
   */
  async getCurrentDoctor(accountId) {
    const doctor = await Doctor.findOne({ accountId });
    if (!doctor) throw new Error('Doctor profile not found');
    return doctor;
  }

  /**
   * Get doctor dashboard overview
   */
  async getDashboard(accountId) {
    const doctor = await this.getCurrentDoctor(accountId);

    const patientIds = doctor.patientIds || [];
    const totalPatients = patientIds.length;

    if (totalPatients === 0) {
      return {
        totalPatients: 0,
        averageAdherence: 0,
        adherentPatients: 0,
        lowAdherencePatients: 0,
        refillNeededCount: 0,
        nextReportDate: this._getNextReportDate(doctor.whatsappReport)
      };
    }

    // Get last 7 days events
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const events = await DoseEvent.find({
      patientId: { $in: patientIds },
      scheduledFor: { $gte: sevenDaysAgo }
    });

    // Group by patient
    const eventsByPatient = {};
    events.forEach(e => {
      if (!eventsByPatient[e.patientId]) eventsByPatient[e.patientId] = [];
      eventsByPatient[e.patientId].push(e);
    });

    let adherentPatients = 0;
    let lowAdherencePatients = 0;
    let totalRate = 0;
    let patientsWithEvents = 0;

    for (const patientId of patientIds) {
      const patientEvents = eventsByPatient[patientId] || [];
      if (patientEvents.length === 0) continue;
      patientsWithEvents++;

      const taken = patientEvents.filter(e => e.status === 'TAKEN').length;
      const rate = Math.round((taken / patientEvents.length) * 100);
      totalRate += rate;

      if (rate >= 80) adherentPatients++;
      if (rate < 50) lowAdherencePatients++;
    }

    const averageAdherence = patientsWithEvents > 0
      ? Math.round(totalRate / patientsWithEvents)
      : 0;

    // Get refill needed count
    const meds = await Medication.find({
      patientId: { $in: patientIds },
      isActive: true
    });
    const refillNeededCount = meds.filter(m => m.isRefillNeededSoon).length;

    return {
      totalPatients,
      averageAdherence,
      adherentPatients,
      lowAdherencePatients,
      refillNeededCount,
      nextReportDate: this._getNextReportDate(doctor.whatsappReport),
      reportEnabled: doctor.whatsappReport?.enabled || false,
      reportDay: doctor.whatsappReport?.day || 'friday',
      reportTime: doctor.whatsappReport?.time || '18:00'
    };
  }

  /**
   * Get list of patients with their adherence stats
   */
  async getPatients(accountId, options = {}) {
    const doctor = await this.getCurrentDoctor(accountId);
    const { search = '', sortBy = 'adherence' } = options;

    const patientIds = doctor.patientIds || [];
    if (patientIds.length === 0) return [];

    const query = { _id: { $in: patientIds } };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await Patient.find(query).select('firstName lastName phone dateOfBirth gender');

    // Get last 30 days events for each patient
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const events = await DoseEvent.find({
      patientId: { $in: patientIds },
      scheduledFor: { $gte: thirtyDaysAgo }
    });

    const eventsByPatient = {};
    events.forEach(e => {
      if (!eventsByPatient[e.patientId]) eventsByPatient[e.patientId] = [];
      eventsByPatient[e.patientId].push(e);
    });

    // Get medications per patient
    const medications = await Medication.find({
      patientId: { $in: patientIds },
      isActive: true
    });

    const medsByPatient = {};
    medications.forEach(m => {
      if (!medsByPatient[m.patientId]) medsByPatient[m.patientId] = [];
      medsByPatient[m.patientId].push(m);
    });

    let result = patients.map(patient => {
      const patientEvents = eventsByPatient[patient._id] || [];
      const taken = patientEvents.filter(e => e.status === 'TAKEN').length;
      const missed = patientEvents.filter(e => e.status === 'MISSED').length;
      const total = patientEvents.length;
      const rate = total > 0 ? Math.round((taken / total) * 100) : 0;

      const patientMeds = medsByPatient[patient._id] || [];
      const refillNeeded = patientMeds.filter(m => m.isRefillNeededSoon).length;

      return {
        _id: patient._id,
        name: `${patient.firstName} ${patient.lastName}`,
        phone: patient.phone,
        age: patient.dateOfBirth
          ? Math.floor((Date.now() - patient.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null,
        gender: patient.gender,
        activeMedications: patientMeds.length,
        adherenceRate: rate,
        dosesTaken: taken,
        dosesMissed: missed,
        dosesTotal: total,
        refillNeededCount: refillNeeded,
        medications: patientMeds.map(m => ({
          _id: m._id,
          name: m.name,
          formType: m.formType,
          isChronic: m.isChronic,
          adherenceRate: m.stats?.adherenceRate || 0,
          daysUntilRefill: m.daysUntilRefill,
          isRefillNeededSoon: m.isRefillNeededSoon
        }))
      };
    });

    // Sort
    if (sortBy === 'adherence') {
      result.sort((a, b) => a.adherenceRate - b.adherenceRate); // worst first
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    }

    return result;
  }

  /**
   * Get a preview of the next WhatsApp weekly report
   * This lets doctors see what will be sent before it's actually sent
   */
  async getWeeklyReportPreview(accountId) {
    const doctor = await this.getCurrentDoctor(accountId);
    const patientIds = doctor.patientIds || [];

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const events = await DoseEvent.find({
      patientId: { $in: patientIds },
      scheduledFor: { $gte: sevenDaysAgo }
    });

    const eventsByPatient = {};
    events.forEach(e => {
      if (!eventsByPatient[e.patientId]) eventsByPatient[e.patientId] = [];
      eventsByPatient[e.patientId].push(e);
    });

    let adherentPatients = 0;
    const lowAdherencePatients = [];
    const totalPatients = patientIds.length;

    for (const patientId of patientIds) {
      const patientEvents = eventsByPatient[patientId] || [];
      const total = patientEvents.length;
      const taken = patientEvents.filter(e => e.status === 'TAKEN').length;
      const missed = patientEvents.filter(e => e.status === 'MISSED').length;
      const rate = total > 0 ? Math.round((taken / total) * 100) : 0;

      if (rate >= 50) adherentPatients++;

      if (rate < 50 && missed > 0) {
        const patient = await Patient.findById(patientId).select('firstName lastName');
        if (patient) {
          lowAdherencePatients.push({
            name: `${patient.firstName} ${patient.lastName}`,
            missedCount: missed,
            adherenceRate: rate
          });
        }
      }
    }

    lowAdherencePatients.sort((a, b) => b.missedCount - a.missedCount);

    // Get refill-soon patients
    const medications = await Medication.find({
      patientId: { $in: patientIds },
      isActive: true
    }).populate('patientId', 'firstName lastName');

    const refillSoonPatients = medications.filter(m => {
      const days = m.daysUntilRefill;
      return days !== null && days <= 7 && days >= 0;
    }).map(m => ({
      name: m.patientId ? `${m.patientId.firstName} ${m.patientId.lastName}` : 'Unknown',
      medication: m.name,
      daysUntilRefill: m.daysUntilRefill
    }));

    // Get new patients
    const newPatients = await Patient.find({
      _id: { $in: patientIds },
      createdAt: { $gte: sevenDaysAgo }
    }).select('firstName lastName');

    // Build the WhatsApp message preview
    const adherenceRate = totalPatients > 0
      ? Math.round((adherentPatients / totalPatients) * 100)
      : 0;

    let message = `د. ${doctor.fullName}، تقرير الالتزام الأسبوعي 📊\n\n`;
    message += `✅ ${adherentPatients} مريض من الـ ${totalPatients} ملتزمين بالدواء (${adherenceRate}%)\n\n`;

    if (lowAdherencePatients.length > 0) {
      message += `❌ ${lowAdherencePatients.length} مرضى مخدوش الدواء الأسبوع ده:\n`;
      lowAdherencePatients.slice(0, 5).forEach(p => {
        message += `• ${p.name} (${p.missedCount} مرات فات)\n`;
      });
      if (lowAdherencePatients.length > 5) {
        message += `• ... و${lowAdherencePatients.length - 5} مريض تاني\n`;
      }
      message += '\n';
    }

    if (refillSoonPatients.length > 0) {
      message += `💊 ${refillSoonPatients.length} مريض هيخلصوا الدواء الأسبوع الجاي\n\n`;
    }

    if (newPatients.length > 0) {
      message += `➕ ${newPatients.length} مريض جديد اتضافوا الأسبوع ده\n\n`;
    }

    message += `تفاصيل أكتر: https://wafa.app/dr/dashboard`;

    return {
      message,
      data: {
        totalPatients,
        adherentPatients,
        adherenceRate,
        lowAdherencePatients,
        refillSoonPatients,
        newPatients: newPatients.map(p => ({ name: `${p.firstName} ${p.lastName}` }))
      },
      nextReportDate: this._getNextReportDate(doctor.whatsappReport),
      reportSettings: doctor.whatsappReport
    };
  }

  /**
   * Update WhatsApp report settings
   */
  async updateReportSettings(accountId, settings) {
    const doctor = await this.getCurrentDoctor(accountId);
    doctor.whatsappReport = { ...doctor.whatsappReport, ...settings };
    await doctor.save();
    logger.info(`Doctor ${doctor._id} updated WhatsApp report settings`);
    return doctor.whatsappReport;
  }

  /**
   * Calculate next report date
   */
  _getNextReportDate(reportSettings) {
    if (!reportSettings?.enabled) return null;

    const dayMap = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
      thursday: 4, friday: 5, saturday: 6
    };
    const targetDay = dayMap[reportSettings.day || 'friday'];
    const [hours, minutes] = (reportSettings.time || '18:00').split(':').map(Number);

    const now = new Date();
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);

    let dayDiff = targetDay - now.getDay();
    if (dayDiff < 0 || (dayDiff === 0 && next <= now)) {
      dayDiff += 7;
    }
    next.setDate(now.getDate() + dayDiff);

    return next.toISOString();
  }
}

module.exports = new DoctorService();
