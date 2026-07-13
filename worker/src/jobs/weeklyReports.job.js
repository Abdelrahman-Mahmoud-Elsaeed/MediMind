// worker/src/jobs/weeklyReports.job.js
const mongoose = require('../../../backend/node_modules/mongoose');
const { logger } = require('../shared/logger');

require('../../../backend/src/modules/auth/models/Doctor.model');
require('../../../backend/src/modules/auth/models/Account.model');
require('../../../backend/src/modules/auth/models/Patient.model');
require('../../../backend/src/modules/medications/models/Medication.model');
require('../../../backend/src/modules/doses/models/DoseEvent.model');

const Doctor = mongoose.model('Doctor');
const Patient = mongoose.model('Patient');
const Medication = mongoose.model('Medication');
const DoseEvent = mongoose.model('DoseEvent');

const whatsappService = require('../../../backend/src/sheared/services/whatsapp.service');

/**
 * Weekly Doctor Reports Job — runs every Friday 6 PM
 *
 * Generates and sends weekly adherence reports to all doctors via WhatsApp.
 * The report includes:
 *  - Total patients + adherence rate
 *  - List of low-adherence patients (<50%)
 *  - Patients running out of medication
 *  - New patients added this week
 */
async function runWeeklyReportsJob() {
  const startTime = Date.now();
  try {
    logger.info('🔄 Weekly doctor reports job started...');

    // Find all doctors with WhatsApp reports enabled
    const doctors = await Doctor.find({
      'whatsappReport.enabled': true
    }).populate('accountId');

    logger.info(`Found ${doctors.length} doctors with WhatsApp reports enabled`);

    let reportsSent = 0;
    let reportsFailed = 0;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    for (const doctor of doctors) {
      try {
        const report = await _buildDoctorReport(doctor, sevenDaysAgo);

        if (report.totalPatients === 0) {
          logger.debug(`Doctor ${doctor._id} has no patients — skipping report`);
          continue;
        }

        await whatsappService.sendDoctorWeeklyReport(doctor, report);
        reportsSent++;
        logger.info(`✅ Weekly report sent to Dr. ${doctor.fullName}`);
      } catch (err) {
        reportsFailed++;
        logger.error(`Failed to send report to Dr. ${doctor._id}:`, err.message);
      }
    }

    const duration = Date.now() - startTime;
    logger.info(
      `✅ Weekly reports job completed in ${duration}ms | ` +
      `Sent: ${reportsSent} | Failed: ${reportsFailed}`
    );

    return { reportsSent, reportsFailed };
  } catch (error) {
    logger.error('❌ Weekly reports job failed:', error.message);
    throw error;
  }
}

async function _buildDoctorReport(doctor, sinceDate) {
  const patientIds = doctor.patientIds || [];
  if (patientIds.length === 0) {
    return {
      totalPatients: 0,
      adherentPatients: 0,
      lowAdherencePatients: [],
      refillSoonPatients: [],
      newPatients: []
    };
  }

  // Get all dose events for this doctor's patients in the last 7 days
  const events = await DoseEvent.find({
    patientId: { $in: patientIds },
    scheduledFor: { $gte: sinceDate }
  });

  // Group events by patient
  const eventsByPatient = {};
  events.forEach(e => {
    if (!eventsByPatient[e.patientId]) eventsByPatient[e.patientId] = [];
    eventsByPatient[e.patientId].push(e);
  });

  let adherentPatients = 0;
  const lowAdherencePatients = [];

  for (const patientId of patientIds) {
    const patientEvents = eventsByPatient[patientId] || [];
    const total = patientEvents.length;
    const taken = patientEvents.filter(e => e.status === 'TAKEN').length;
    const missed = patientEvents.filter(e => e.status === 'MISSED').length;
    const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;

    if (adherenceRate >= 50) {
      adherentPatients++;
    }

    if (adherenceRate < 50 && missed > 0) {
      const patient = await Patient.findById(patientId).select('firstName lastName');
      if (patient) {
        lowAdherencePatients.push({
          name: `${patient.firstName} ${patient.lastName}`,
          missedCount: missed,
          adherenceRate
        });
      }
    }
  }

  // Sort low-adherence patients by missed count (worst first)
  lowAdherencePatients.sort((a, b) => b.missedCount - a.missedCount);

  // Get patients with medications running out within 7 days
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

  // Get new patients added this week
  const newPatients = await Patient.find({
    _id: { $in: patientIds },
    createdAt: { $gte: sinceDate }
  }).select('firstName lastName');

  return {
    totalPatients: patientIds.length,
    adherentPatients,
    lowAdherencePatients,
    refillSoonPatients,
    newPatients: newPatients.map(p => ({
      name: `${p.firstName} ${p.lastName}`
    }))
  };
}

module.exports = runWeeklyReportsJob;
