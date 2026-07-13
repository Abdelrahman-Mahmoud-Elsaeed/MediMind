const Pharmacy = require('../../auth/models/Pharmacy.model');
const Patient = require('../../auth/models/Patient.model');
const Medication = require('../../medications/models/Medication.model');
const DoseEvent = require('../../doses/models/DoseEvent.model');
const { logger } = require('../../../sheared/utils/logger');

/**
 * Pharmacy Service — وفاء (Wafa)
 *
 * B2B-facing service for pharmacy dashboards.
 * Returns aggregated patient data, refill alerts, and analytics.
 */
class PharmacyService {

  /**
   * Get the pharmacy profile for the current account
   */
  async getCurrentPharmacy(accountId) {
    const pharmacy = await Pharmacy.findOne({ accountId });
    if (!pharmacy) throw new Error('Pharmacy profile not found');
    return pharmacy;
  }

  /**
   * Get pharmacy dashboard stats
   * @param {String} accountId - Pharmacy's account ID
   */
  async getDashboardStats(accountId) {
    const pharmacy = await this.getCurrentPharmacy(accountId);

    const totalPatients = pharmacy.patientIds.length;

    // Get active patients (those with at least 1 active medication)
    const activeMedications = await Medication.find({
      patientId: { $in: pharmacy.patientIds },
      isActive: true
    }).distinct('patientId');
    const activePatients = activeMedications.length;

    // Get refill-needed count
    const medications = await Medication.find({
      patientId: { $in: pharmacy.patientIds },
      isActive: true
    });
    const refillNeededCount = medications.filter(m => m.isRefillNeededSoon).length;

    // Calculate estimated revenue (sum of refill-needed × avg price 50 EGP)
    const estimatedRevenue = refillNeededCount * 50;

    // Update pharmacy stats
    pharmacy.stats.totalPatients = totalPatients;
    pharmacy.stats.activePatients = activePatients;
    pharmacy.stats.totalRefills = refillNeededCount;
    pharmacy.stats.estimatedRevenue = estimatedRevenue;
    await pharmacy.save();

    return {
      totalPatients,
      activePatients,
      refillNeededCount,
      estimatedRevenue,
      pilotActive: pharmacy.isInPilot(),
      subscriptionStatus: pharmacy.subscription?.status || 'none'
    };
  }

  /**
   * Get list of patients linked to this pharmacy
   * @param {String} accountId - Pharmacy's account ID
   * @param {Object} options - { search, page, limit }
   */
  async getPatients(accountId, options = {}) {
    const pharmacy = await this.getCurrentPharmacy(accountId);
    const { search = '', page = 1, limit = 20 } = options;

    const patientQuery = {
      _id: { $in: pharmacy.patientIds }
    };
    if (search) {
      patientQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const patients = await Patient.find(patientQuery)
      .select('firstName lastName phone dateOfBirth')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // For each patient, get their medications count and adherence
    const enrichedPatients = await Promise.all(
      patients.map(async (patient) => {
        const meds = await Medication.find({
          patientId: patient._id,
          isActive: true,
          pharmacyId: pharmacy._id
        }).select('name inventory.currentQuantity inventory.doseAmount schedule.dosesPerDay');

        const refillNeeded = meds.filter(m => m.isRefillNeededSoon).length;

        // Get last 30 days adherence
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const events = await DoseEvent.find({
          patientId: patient._id,
          scheduledFor: { $gte: thirtyDaysAgo }
        });
        const taken = events.filter(e => e.status === 'TAKEN').length;
        const total = events.length;
        const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;

        return {
          _id: patient._id,
          name: `${patient.firstName} ${patient.lastName}`,
          phone: patient.phone,
          age: patient.dateOfBirth
            ? Math.floor((Date.now() - patient.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
            : null,
          activeMedications: meds.length,
          refillNeededCount: refillNeeded,
          adherenceRate,
          medications: meds.map(m => ({
            _id: m._id,
            name: m.name,
            currentQuantity: m.inventory.currentQuantity,
            daysUntilRefill: m.daysUntilRefill,
            isRefillNeededSoon: m.isRefillNeededSoon
          }))
        };
      })
    );

    const totalCount = await Patient.countDocuments(patientQuery);

    return {
      patients: enrichedPatients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };
  }

  /**
   * Get patients with medications that need refill soon
   */
  async getRefillNeededPatients(accountId) {
    const pharmacy = await this.getCurrentPharmacy(accountId);

    const medications = await Medication.find({
      patientId: { $in: pharmacy.patientIds },
      pharmacyId: pharmacy._id,
      isActive: true
    })
      .populate('patientId', 'firstName lastName phone')
      .sort({ 'inventory.currentQuantity': 1 });

    const refillNeeded = medications
      .filter(m => m.isRefillNeededSoon)
      .map(m => ({
        medicationId: m._id,
        medicationName: m.name,
        currentQuantity: m.inventory.currentQuantity,
        doseAmount: m.inventory.doseAmount,
        unit: m.inventory.unit,
        daysUntilRefill: m.daysUntilRefill,
        patient: m.patientId ? {
          id: m.patientId._id,
          name: `${m.patientId.firstName} ${m.patientId.lastName}`,
          phone: m.patientId.phone
        } : null
      }));

    return refillNeeded;
  }

  /**
   * Send a refill reminder to a specific patient
   * @param {String} accountId - Pharmacy's account ID
   * @param {String} patientId - Patient ID to remind
   * @param {String} medicationId - Optional medication ID
   */
  async sendRefillReminder(accountId, patientId, medicationId = null) {
    const pharmacy = await this.getCurrentPharmacy(accountId);

    // Verify patient is linked to this pharmacy
    if (!pharmacy.patientIds.includes(patientId)) {
      throw new Error('Patient is not linked to this pharmacy');
    }

    const patient = await Patient.findById(patientId).populate('accountId');
    if (!patient) throw new Error('Patient not found');

    let medications;
    if (medicationId) {
      medications = await Medication.find({
        _id: medicationId,
        patientId,
        pharmacyId: pharmacy._id
      });
    } else {
      // Send reminder for all refill-needed meds
      medications = await Medication.find({
        patientId,
        pharmacyId: pharmacy._id,
        isActive: true
      });
      medications = medications.filter(m => m.isRefillNeededSoon);
    }

    if (medications.length === 0) {
      return { success: false, message: 'No medications need refill' };
    }

    // Send notifications
    const notificationService = require('../../notifications/services/notification.service');
    for (const med of medications) {
      const daysRemaining = med.daysUntilRefill || 0;
      await notificationService.sendRefillReminder(
        patient,
        med,
        daysRemaining,
        pharmacy.pharmacyName
      );
    }

    logger.info(`Pharmacy ${pharmacy.pharmacyName} sent refill reminder to patient ${patientId}`);

    return {
      success: true,
      remindersSent: medications.length,
      medications: medications.map(m => ({ id: m._id, name: m.name }))
    };
  }

  /**
   * Get weekly analytics report
   */
  async getWeeklyAnalytics(accountId) {
    const pharmacy = await this.getCurrentPharmacy(accountId);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get all medications linked to this pharmacy
    const medications = await Medication.find({
      pharmacyId: pharmacy._id,
      isActive: true
    }).populate('patientId', 'firstName lastName');

    // Get dose events from the last 7 days for these medications
    const medicationIds = medications.map(m => m._id);
    const events = await DoseEvent.find({
      medicationId: { $in: medicationIds },
      scheduledFor: { $gte: sevenDaysAgo }
    });

    const total = events.length;
    const taken = events.filter(e => e.status === 'TAKEN').length;
    const missed = events.filter(e => e.status === 'MISSED').length;

    // Refills in the last 7 days
    const refillsThisWeek = medications.filter(m =>
      m.inventory.lastRefilledAt && m.inventory.lastRefilledAt >= sevenDaysAgo
    ).length;

    // Patients who need refill next week
    const refillNextWeek = medications.filter(m => {
      const days = m.daysUntilRefill;
      return days !== null && days <= 7;
    }).length;

    return {
      week: {
        start: sevenDaysAgo.toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      totalPatients: pharmacy.patientIds.length,
      activeMedications: medications.length,
      dosesScheduled: total,
      dosesTaken: taken,
      dosesMissed: missed,
      adherenceRate: total > 0 ? Math.round((taken / total) * 100) : 0,
      refillsThisWeek,
      refillNextWeek,
      estimatedRevenueNextWeek: refillNextWeek * 50
    };
  }
}

module.exports = new PharmacyService();
