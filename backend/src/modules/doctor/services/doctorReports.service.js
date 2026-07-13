const Doctor = require('../../auth/models/Doctor.model');
const Patient = require('../../auth/models/Patient.model');
const Medication = require('../../medications/models/Medication.model');
const DoseEvent = require('../../doses/models/DoseEvent.model');
const { logger } = require('../../../sheared/utils/logger');

/**
 * Doctor Reports Service — وفاء (Wafa)
 *
 * Provides deep analytics for doctors who want more than the weekly WhatsApp report.
 * Generates:
 *  - Patient-by-patient breakdown (30/90 days)
 *  - Per-medication adherence
 *  - Adherence trend over time (line chart data)
 *  - Cohort analysis (adherent vs non-adherent)
 *  - Patients needing intervention
 */
class DoctorReportsService {

  /**
   * Get full report for the doctor's panel
   * @param {String} accountId - Doctor's account ID
   * @param {Object} options - { period: 7|30|90 }
   */
  async getFullReport(accountId, options = {}) {
    const period = options.period || 30;
    const doctor = await Doctor.findOne({ accountId });
    if (!doctor) throw new Error('Doctor profile not found');

    const patientIds = doctor.patientIds || [];
    if (patientIds.length === 0) {
      return this._emptyReport(period);
    }

    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);

    // Get all dose events in the period
    const events = await DoseEvent.find({
      patientId: { $in: patientIds },
      scheduledFor: { $gte: startDate }
    }).populate('medicationId', 'name formType isChronic');

    // Group events by patient
    const eventsByPatient = this._groupBy(events, 'patientId');

    // ===== 1. PATIENT BREAKDOWN =====
    const patientBreakdown = await this._buildPatientBreakdown(
      patientIds,
      eventsByPatient,
      startDate,
      period
    );

    // ===== 2. COHORT ANALYSIS =====
    const cohort = this._buildCohort(patientBreakdown);

    // ===== 3. ADHERENCE TREND (line chart) =====
    const trend = this._buildTrend(events, period);

    // ===== 4. PER-MEDICATION STATS =====
    const medications = await Medication.find({
      patientId: { $in: patientIds },
      isActive: true
    }).populate('patientId', 'firstName lastName');
    const medicationStats = this._buildMedicationStats(medications, events);

    // ===== 5. INTERVENTION LIST =====
    const interventions = this._buildInterventionList(patientBreakdown, medications);

    // ===== 6. REFILL ALERTS =====
    const refillAlerts = this._buildRefillAlerts(medications);

    // ===== 7. WEEKLY HEATMAP =====
    const heatmap = this._buildHeatmap(events);

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      summary: {
        totalPatients: patientIds.length,
        ...cohort,
        averageAdherence: this._average(patientBreakdown.map(p => p.adherenceRate)),
        totalDosesScheduled: events.length,
        totalDosesTaken: events.filter(e => e.status === 'TAKEN').length,
        totalDosesMissed: events.filter(e => e.status === 'MISSED').length
      },
      patientBreakdown,
      trend,
      medicationStats,
      interventions,
      refillAlerts,
      heatmap
    };
  }

  /**
   * Get detailed report for a single patient
   */
  async getPatientDetail(accountId, patientId, options = {}) {
    const period = options.period || 30;
    const doctor = await Doctor.findOne({ accountId });
    if (!doctor) throw new Error('Doctor profile not found');

    // Verify patient is linked
    if (!doctor.patientIds.includes(patientId)) {
      throw new Error('Patient not linked to this doctor');
    }

    const patient = await Patient.findById(patientId);
    if (!patient) throw new Error('Patient not found');

    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);

    const [events, medications] = await Promise.all([
      DoseEvent.find({
        patientId,
        scheduledFor: { $gte: startDate }
      }).populate('medicationId'),
      Medication.find({ patientId, isActive: true })
    ]);

    // Daily adherence
    const dailyAdherence = this._buildTrend(events, period);

    // Per-medication breakdown
    const perMedication = medications.map(med => {
      const medEvents = events.filter(e =>
        e.medicationId?._id.equals(med._id) || String(e.medicationId?._id) === String(med._id)
      );
      const taken = medEvents.filter(e => e.status === 'TAKEN').length;
      const total = medEvents.length;
      return {
        medicationId: med._id,
        name: med.name,
        formType: med.formType,
        isChronic: med.isChronic,
        dosesScheduled: total,
        dosesTaken: taken,
        dosesMissed: medEvents.filter(e => e.status === 'MISSED').length,
        dosesSkipped: medEvents.filter(e => e.status === 'SKIPPED').length,
        adherenceRate: total > 0 ? Math.round((taken / total) * 100) : 0,
        currentStreak: med.stats?.currentStreak || 0,
        daysUntilRefill: med.daysUntilRefill,
        isRefillNeededSoon: med.isRefillNeededSoon
      };
    });

    // Streak history
    const streakHistory = this._buildStreakHistory(events);

    // Time-of-day analysis (when does patient miss most?)
    const timeAnalysis = this._buildTimeAnalysis(events);

    return {
      patient: {
        _id: patient._id,
        name: `${patient.firstName} ${patient.lastName}`,
        phone: patient.phone,
        age: patient.dateOfBirth
          ? Math.floor((Date.now() - patient.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null,
        gender: patient.gender,
        currentStreak: patient.gamification?.currentStreak || 0,
        longestStreak: patient.gamification?.longestStreak || 0,
        totalBadges: patient.gamification?.badges?.length || 0
      },
      period,
      summary: {
        adherenceRate: this._average([this._calcRate(events)]),
        totalDoses: events.length,
        dosesTaken: events.filter(e => e.status === 'TAKEN').length,
        dosesMissed: events.filter(e => e.status === 'MISSED').length,
        dosesSkipped: events.filter(e => e.status === 'SKIPPED').length,
        activeMedications: medications.length
      },
      dailyAdherence,
      perMedication,
      streakHistory,
      timeAnalysis,
      refillNeeded: perMedication.filter(m => m.isRefillNeededSoon)
    };
  }

  // ===== PRIVATE HELPERS =====

  _emptyReport(period) {
    return {
      period,
      summary: {
        totalPatients: 0,
        adherent: 0,
        nonAdherent: 0,
        averageAdherence: 0,
        totalDosesScheduled: 0,
        totalDosesTaken: 0,
        totalDosesMissed: 0
      },
      patientBreakdown: [],
      trend: [],
      medicationStats: [],
      interventions: [],
      refillAlerts: [],
      heatmap: []
    };
  }

  _groupBy(arr, key) {
    return arr.reduce((acc, item) => {
      const k = String(item[key]);
      if (!acc[k]) acc[k] = [];
      acc[k].push(item);
      return acc;
    }, {});
  }

  _average(nums) {
    if (!nums.length) return 0;
    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
  }

  _calcRate(events) {
    if (!events.length) return 0;
    const taken = events.filter(e => e.status === 'TAKEN').length;
    return Math.round((taken / events.length) * 100);
  }

  async _buildPatientBreakdown(patientIds, eventsByPatient, startDate, period) {
    const patients = await Patient.find({ _id: { $in: patientIds } })
      .select('firstName lastName phone dateOfBirth gender');

    return patients.map(patient => {
      const events = eventsByPatient[String(patient._id)] || [];
      const taken = events.filter(e => e.status === 'TAKEN').length;
      const missed = events.filter(e => e.status === 'MISSED').length;
      const skipped = events.filter(e => e.status === 'SKIPPED').length;
      const total = events.length;
      const rate = total > 0 ? Math.round((taken / total) * 100) : 0;

      return {
        _id: patient._id,
        name: `${patient.firstName} ${patient.lastName}`,
        phone: patient.phone,
        age: patient.dateOfBirth
          ? Math.floor((Date.now() - patient.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null,
        gender: patient.gender,
        adherenceRate: rate,
        dosesScheduled: total,
        dosesTaken: taken,
        dosesMissed: missed,
        dosesSkipped: skipped,
        // Trend direction: compare last 7 days vs previous 7 days
        trendDirection: this._calcTrendDirection(events),
        status: rate >= 80 ? 'ADHERENT' : rate >= 50 ? 'MODERATE' : 'NON_ADHERENT',
        currentStreak: patient.gamification?.currentStreak || 0
      };
    }).sort((a, b) => a.adherenceRate - b.adherenceRate); // worst first
  }

  _calcTrendDirection(events) {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;

    const recent = events.filter(e => e.scheduledFor >= sevenDaysAgo);
    const previous = events.filter(e =>
      e.scheduledFor >= fourteenDaysAgo && e.scheduledFor < sevenDaysAgo
    );

    const recentRate = this._calcRate(recent);
    const previousRate = this._calcRate(previous);

    if (recentRate > previousRate + 5) return 'IMPROVING';
    if (recentRate < previousRate - 5) return 'DECLINING';
    return 'STABLE';
  }

  _buildCohort(patientBreakdown) {
    const adherent = patientBreakdown.filter(p => p.adherenceRate >= 80).length;
    const moderate = patientBreakdown.filter(p =>
      p.adherenceRate >= 50 && p.adherenceRate < 80
    ).length;
    const nonAdherent = patientBreakdown.filter(p => p.adherenceRate < 50).length;

    return {
      adherent,
      moderate,
      nonAdherent,
      adherenceDistribution: {
        excellent: patientBreakdown.filter(p => p.adherenceRate >= 90).length,
        good: patientBreakdown.filter(p => p.adherenceRate >= 70 && p.adherenceRate < 90).length,
        fair: patientBreakdown.filter(p => p.adherenceRate >= 50 && p.adherenceRate < 70).length,
        poor: patientBreakdown.filter(p => p.adherenceRate >= 30 && p.adherenceRate < 50).length,
        critical: patientBreakdown.filter(p => p.adherenceRate < 30).length
      }
    };
  }

  _buildTrend(events, period) {
    const days = [];
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    for (let i = period - 1; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayEvents = events.filter(e =>
        e.scheduledFor >= dayStart && e.scheduledFor <= dayEnd
      );

      const taken = dayEvents.filter(e => e.status === 'TAKEN').length;
      const total = dayEvents.length;
      const rate = total > 0 ? Math.round((taken / total) * 100) : 0;

      days.push({
        date: dayStart.toISOString().split('T')[0],
        dayName: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        taken,
        total,
        rate
      });
    }

    return days;
  }

  _buildMedicationStats(medications, allEvents) {
    return medications.map(med => {
      const medEvents = allEvents.filter(e =>
        e.medicationId?._id && (
          (e.medicationId._id.equals && e.medicationId._id.equals(med._id)) ||
          String(e.medicationId._id) === String(med._id)
        )
      );

      const taken = medEvents.filter(e => e.status === 'TAKEN').length;
      const total = medEvents.length;
      const rate = total > 0 ? Math.round((taken / total) * 100) : 0;

      return {
        _id: med._id,
        name: med.name,
        formType: med.formType,
        isChronic: med.isChronic,
        patientCount: medications.filter(m => m.name === med.name).length,
        dosesScheduled: total,
        dosesTaken: taken,
        adherenceRate: rate,
        daysUntilRefill: med.daysUntilRefill,
        isRefillNeededSoon: med.isRefillNeededSoon
      };
    }).sort((a, b) => a.adherenceRate - b.adherenceRate);
  }

  _buildInterventionList(patientBreakdown, medications) {
    const interventions = [];

    patientBreakdown.forEach(patient => {
      // Critical: adherence < 30%
      if (patient.adherenceRate < 30) {
        interventions.push({
          patientId: patient._id,
          patientName: patient.name,
          type: 'CRITICAL_NON_ADHERENCE',
          severity: 'critical',
          message: `${patient.name} لديه التزام منخفض جداً (${patient.adherenceRate}%) — يحتاج تدخل فوري`,
          recommendation: 'التواصل المباشر مع المريض ومراجعة الخطة العلاجية'
        });
      }
      // Declining trend
      else if (patient.trendDirection === 'DECLINING') {
        interventions.push({
          patientId: patient._id,
          patientName: patient.name,
          type: 'DECLINING_TREND',
          severity: 'warning',
          message: `${patient.name} التزامهبينخفض (${patient.adherenceRate}%) — متابعة قريبة`,
          recommendation: 'مراجعة الأدوية والأعراض الجانبية المحتملة'
        });
      }
      // Many missed doses
      else if (patient.dosesMissed > 5) {
        interventions.push({
          patientId: patient._id,
          patientName: patient.name,
          type: 'HIGH_MISSES',
          severity: 'warning',
          message: `${patient.name} فاته ${patient.dosesMissed} جرعات — يحتاج متابعة`,
          recommendation: 'مناقشة جدول الأدوية وتعديله لو لزم'
        });
      }
    });

    return interventions;
  }

  _buildRefillAlerts(medications) {
    return medications
      .filter(m => m.isRefillNeededSoon)
      .map(m => ({
        medicationId: m._id,
        medicationName: m.name,
        patientName: m.patientId ? `${m.patientId.firstName} ${m.patientId.lastName}` : 'Unknown',
        daysUntilRefill: m.daysUntilRefill,
        currentQuantity: m.inventory.currentQuantity,
        severity: m.daysUntilRefill <= 2 ? 'critical' : 'warning'
      }))
      .sort((a, b) => a.daysUntilRefill - b.daysUntilRefill);
  }

  _buildHeatmap(events) {
    // Build a 7-day x 24-hour heatmap of dose events
    // Helps doctors see when patients are most likely to miss
    const heatmap = Array(7).fill(null).map(() => Array(24).fill(0));

    events.forEach(e => {
      if (e.status === 'MISSED') {
        const day = e.scheduledFor.getDay();
        const hour = e.scheduledFor.getHours();
        heatmap[day][hour]++;
      }
    });

    return {
      days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      hours: Array.from({ length: 24 }, (_, i) => i),
      data: heatmap
    };
  }

  _buildStreakHistory(events) {
    // Calculate streak history from events
    // Returns array of { date, streak }
    const sorted = events
      .filter(e => e.status === 'TAKEN' || e.status === 'MISSED')
      .sort((a, b) => a.scheduledFor - b.scheduledFor);

    let streak = 0;
    const history = [];

    sorted.forEach(e => {
      if (e.status === 'TAKEN') {
        streak++;
      } else {
        streak = 0;
      }
      history.push({
        date: e.scheduledFor.toISOString().split('T')[0],
        streak,
        status: e.status
      });
    });

    // Group by day and take max streak per day
    const byDay = {};
    history.forEach(h => {
      if (!byDay[h.date] || byDay[h.date].streak < h.streak) {
        byDay[h.date] = h;
      }
    });

    return Object.values(byDay);
  }

  _buildTimeAnalysis(events) {
    // Analyze adherence by time of day
    const slots = {
      'morning': { taken: 0, total: 0, label: 'الصباح (6-12)' },
      'noon': { taken: 0, total: 0, label: 'الضهر (12-15)' },
      'evening': { taken: 0, total: 0, label: 'المساء (15-19)' },
      'night': { taken: 0, total: 0, label: 'الليل (19-24)' },
      'dawn': { taken: 0, total: 0, label: 'الفجر (0-6)' }
    };

    events.forEach(e => {
      const hour = e.scheduledFor.getHours();
      let slot;
      if (hour >= 6 && hour < 12) slot = 'morning';
      else if (hour >= 12 && hour < 15) slot = 'noon';
      else if (hour >= 15 && hour < 19) slot = 'evening';
      else if (hour >= 19) slot = 'night';
      else slot = 'dawn';

      slots[slot].total++;
      if (e.status === 'TAKEN') slots[slot].taken++;
    });

    return Object.entries(slots).map(([key, val]) => ({
      slot: key,
      label: val.label,
      taken: val.taken,
      total: val.total,
      adherenceRate: val.total > 0 ? Math.round((val.taken / val.total) * 100) : 0
    }));
  }
}

module.exports = new DoctorReportsService();
