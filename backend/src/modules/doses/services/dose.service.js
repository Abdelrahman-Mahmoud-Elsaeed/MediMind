const DoseEvent = require('../models/DoseEvent.model');
const Medication = require('../../medications/models/Medication.model');
const Patient = require('../../auth/models/Patient.model');
const socketService = require('../../../sheared/services/socket.service');
const { logger } = require('../../../sheared/utils/logger');

/**
 * Dose Service — وفاء (Wafa)
 *
 * Handles dose confirmation, daily schedule retrieval, and adherence calculations.
 */
class DoseService {

  /**
   * Confirm a dose as taken
   * @param {String} doseEventId - DoseEvent ID
   * @param {String} accountId - Account confirming (for audit)
   * @param {String} takenVia - How the dose was confirmed
   */
  async confirm(doseEventId, accountId, takenVia = 'PWA') {
    const event = await DoseEvent.findById(doseEventId).populate('medicationId');
    if (!event) throw new Error('Dose event not found');
    if (event.status === 'TAKEN') throw new Error('Dose already taken');
    if (event.status === 'SKIPPED') throw new Error('Cannot confirm a skipped dose');

    // Check if medication is expired
    if (event.medicationId.isExpired) {
      throw new Error('Cannot confirm dose — medication is expired');
    }

    // Update dose event
    event.status = 'TAKEN';
    event.takenAt = new Date();
    event.takenVia = takenVia;
    event.escalationState = 'NONE';
    await event.save();

    // Decrement medication inventory (CRITICAL business rule)
    const medication = event.medicationId;
    const decremented = medication.decrementInventory();
    if (!decremented) {
      logger.warn(`Insufficient inventory for medication ${medication._id}`);
    }

    // Update medication stats
    medication.stats.totalDosesTaken = (medication.stats.totalDosesTaken || 0) + 1;
    medication.stats.lastDoseTakenAt = new Date();
    medication.stats.currentStreak = (medication.stats.currentStreak || 0) + 1;

    // Recalculate adherence rate
    medication.stats.totalDosesScheduled = (medication.stats.totalDosesScheduled || 0) + 1;
    medication.stats.adherenceRate = Math.round(
      (medication.stats.totalDosesTaken / medication.stats.totalDosesScheduled) * 100
    );

    await medication.save();

    // Update patient gamification
    const patient = await Patient.findById(event.patientId);
    if (patient) {
      patient.gamification.totalDosesTaken = (patient.gamification.totalDosesTaken || 0) + 1;
      patient.gamification.totalDosesScheduled = (patient.gamification.totalDosesScheduled || 0) + 1;
      patient.gamification.currentStreak = (patient.gamification.currentStreak || 0) + 1;
      if (patient.gamification.currentStreak > patient.gamification.longestStreak) {
        patient.gamification.longestStreak = patient.gamification.currentStreak;
      }

      // Check for badge awards
      this._checkBadges(patient);

      await patient.save();
    }

    // ===== Emit Socket.IO events for real-time updates =====
    // Notify the patient's room (caregivers + doctors watching this patient)
    socketService.emitToPatientRoom(event.patientId, 'dose:confirmed', {
      doseEventId: event._id,
      medicationId: event.medicationId._id,
      medicationName: event.medicationId.name,
      patientId: event.patientId,
      takenAt: event.takenAt,
      takenVia: takenVia,
      inventoryRemaining: medication.inventory.currentQuantity,
      currentStreak: patient?.gamification.currentStreak || 0
    });

    logger.info(`Dose confirmed: ${doseEventId} via ${takenVia}`);
    return {
      doseEventId: event._id,
      status: 'TAKEN',
      takenAt: event.takenAt,
      inventoryRemaining: medication.inventory.currentQuantity,
      currentStreak: patient?.gamification.currentStreak || 0
    };
  }

  /**
   * Skip a dose
   */
  async skip(doseEventId, accountId, reason = null) {
    const event = await DoseEvent.findById(doseEventId);
    if (!event) throw new Error('Dose event not found');
    if (event.status !== 'PENDING') throw new Error('Cannot skip a non-pending dose');

    event.status = 'SKIPPED';
    await event.save();

    // Reset patient streak
    const patient = await Patient.findById(event.patientId);
    if (patient) {
      patient.gamification.totalDosesScheduled = (patient.gamification.totalDosesScheduled || 0) + 1;
      patient.gamification.currentStreak = 0; // streak broken
      await patient.save();
    }

    logger.info(`Dose skipped: ${doseEventId}`);
    return { doseEventId: event._id, status: 'SKIPPED' };
  }

  /**
   * Get daily schedule for a patient
   * @param {String} patientId - Patient ID
   * @param {Date} date - Date to fetch (defaults to today)
   */
  async getDailySchedule(patientId, date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const events = await DoseEvent.find({
      patientId,
      scheduledFor: { $gte: startOfDay, $lte: endOfDay }
    })
      .populate('medicationId', 'name nameAr formType inventory.doseAmount inventory.unit instructions')
      .sort({ scheduledFor: 1 });

    return events;
  }

  /**
   * Get adherence stats for a patient
   * @param {String} patientId - Patient ID
   * @param {Number} days - Number of days to calculate (default 30)
   */
  async getAdherenceStats(patientId, days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const events = await DoseEvent.find({
      patientId,
      scheduledFor: { $gte: startDate }
    });

    const total = events.length;
    const taken = events.filter(e => e.status === 'TAKEN').length;
    const missed = events.filter(e => e.status === 'MISSED').length;
    const skipped = events.filter(e => e.status === 'SKIPPED').length;
    const pending = events.filter(e => e.status === 'PENDING').length;

    const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;

    // Daily breakdown for chart
    const dailyBreakdown = [];
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayEvents = events.filter(e =>
        e.scheduledFor >= dayStart && e.scheduledFor <= dayEnd
      );
      const dayTaken = dayEvents.filter(e => e.status === 'TAKEN').length;
      const dayTotal = dayEvents.length;
      const dayRate = dayTotal > 0 ? Math.round((dayTaken / dayTotal) * 100) : 0;

      dailyBreakdown.push({
        date: dayStart.toISOString().split('T')[0],
        taken: dayTaken,
        total: dayTotal,
        rate: dayRate
      });
    }

    return {
      period: `${days} days`,
      total,
      taken,
      missed,
      skipped,
      pending,
      adherenceRate,
      dailyBreakdown
    };
  }

  /**
   * Get doses that are pending and overdue (for escalation)
   * Called by background worker
   */
  async getPendingDosesForEscalation() {
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Doses needing push escalation (just past scheduled time, no escalation yet)
    const needsPush = await DoseEvent.find({
      status: 'PENDING',
      escalationState: 'NONE',
      scheduledFor: { $lte: now }
    }).populate('patientId').populate('medicationId');

    // Doses needing SMS escalation (15 min after scheduled, only push sent)
    const needsSms = await DoseEvent.find({
      status: 'PENDING',
      escalationState: 'PUSH_SENT',
      scheduledFor: { $lte: fifteenMinutesAgo }
    }).populate('patientId').populate('medicationId');

    // Doses needing caregiver alert (30 min after scheduled, only SMS sent)
    const needsCaregiverAlert = await DoseEvent.find({
      status: 'PENDING',
      escalationState: 'SMS_SENT',
      scheduledFor: { $lte: thirtyMinutesAgo }
    }).populate('patientId').populate('medicationId');

    return { needsPush, needsSms, needsCaregiverAlert };
  }

  /**
   * Mark a dose as missed (after escalation completes)
   */
  async markAsMissed(doseEventId) {
    const event = await DoseEvent.findById(doseEventId);
    if (!event) return null;
    if (event.status !== 'PENDING') return event;

    event.status = 'MISSED';
    await event.save();

    // Reset patient streak
    const patient = await Patient.findById(event.patientId);
    if (patient) {
      patient.gamification.totalDosesScheduled = (patient.gamification.totalDosesScheduled || 0) + 1;
      patient.gamification.currentStreak = 0;
      await patient.save();
    }

    return event;
  }

  /**
   * Check and award badges
   */
  _checkBadges(patient) {
    const streak = patient.gamification.currentStreak || 0;
    const total = patient.gamification.totalDosesTaken || 0;
    const badges = patient.gamification.badges || [];
    const existingTypes = badges.map(b => b.type);

    const newBadges = [];
    if (streak >= 7 && !existingTypes.includes('streak_7')) {
      newBadges.push({ type: 'streak_7', awardedAt: new Date() });
    }
    if (streak >= 30 && !existingTypes.includes('streak_30')) {
      newBadges.push({ type: 'streak_30', awardedAt: new Date() });
    }
    if (streak >= 90 && !existingTypes.includes('streak_90')) {
      newBadges.push({ type: 'streak_90', awardedAt: new Date() });
    }
    if (total >= 7 && !existingTypes.includes('first_week')) {
      newBadges.push({ type: 'first_week', awardedAt: new Date() });
    }
    if (total >= 30 && !existingTypes.includes('first_month')) {
      newBadges.push({ type: 'first_month', awardedAt: new Date() });
    }

    patient.gamification.badges = [...badges, ...newBadges];
    return newBadges;
  }
}

module.exports = new DoseService();
