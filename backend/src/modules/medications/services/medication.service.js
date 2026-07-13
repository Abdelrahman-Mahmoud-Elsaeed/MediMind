const Medication = require('../models/Medication.model');
const MedicalCondition = require('../../conditions/models/MedicalCondition.model');
const Patient = require('../../auth/models/Patient.model');
const { logger } = require('../../../sheared/utils/logger');

/**
 * Medication Service — وفاء (Wafa)
 *
 * Handles CRUD operations for medications, inventory management,
 * and AI-powered OCR scanning (stub for now).
 */
class MedicationService {

  /**
   * Create a new medication
   * @param {Object} accountId - Account ID of creator
   * @param {String} role - Role of creator (PATIENT or CAREGIVER)
   * @param {Object} data - Medication data
   */
  async create(accountId, role, data) {
    // Determine patient ID
    let patientId;

    if (role === 'PATIENT') {
      const patient = await Patient.findOne({ accountId });
      if (!patient) throw new Error('Patient profile not found');
      patientId = patient._id;
    } else if (role === 'CAREGIVER') {
      // Caregiver creates medication for a patient — need patientId in body
      if (!data.patientId) throw new Error('patientId is required when caregiver creates medication');
      patientId = data.patientId;
      // TODO: Verify caregiver is linked to this patient
    } else {
      throw new Error('Only PATIENT or CAREGIVER can create medications');
    }

    // Validate expiration date is in the future
    if (new Date(data.expirationDate) <= new Date()) {
      throw new Error('Expiration date must be in the future');
    }

    // If conditionId provided, verify it belongs to the patient
    if (data.conditionId) {
      const condition = await MedicalCondition.findOne({
        _id: data.conditionId,
        patientId
      });
      if (!condition) throw new Error('Invalid condition ID for this patient');
    }

    // For chronic medications, endDate should be null
    if (data.isChronic && data.schedule.endDate) {
      data.schedule.endDate = null;
    }

    const medication = new Medication({
      ...data,
      patientId,
      addedBy: accountId,
      inventory: {
        ...data.inventory,
        // If currentQuantity not provided, use initialQuantity
        currentQuantity: data.inventory.currentQuantity ?? data.inventory.initialQuantity
      }
    });

    await medication.save();
    logger.info(`Medication created: ${meditation.name} for patient ${patientId}`);

    return medication;
  }

  /**
   * Get all medications for a patient
   * @param {String} patientId - Patient ID
   * @param {Object} options - { isActive }
   */
  async getByPatient(patientId, options = {}) {
    const filter = { patientId };
    if (options.isActive !== undefined) {
      filter.isActive = options.isActive;
    }

    const medications = await Medication.find(filter)
      .populate('conditionId', 'diseaseName diseaseNameAr isChronic')
      .populate('pharmacyId', 'pharmacyName address')
      .sort({ 'schedule.firstDoseTime': 1 });

    return medications;
  }

  /**
   * Get a single medication by ID
   */
  async getById(medicationId, accountId = null) {
    const medication = await Medication.findById(medicationId)
      .populate('conditionId')
      .populate('pharmacyId', 'pharmacyName phone address');

    if (!medication) throw new Error('Medication not found');

    // TODO: Verify accountId has access to this medication

    return medication;
  }

  /**
   * Update a medication
   */
  async update(medicationId, accountId, updateData) {
    const medication = await Medication.findById(medicationId);
    if (!medication) throw new Error('Medication not found');

    // Apply updates
    Object.keys(updateData).forEach(key => {
      if (typeof updateData[key] === 'object' && !Array.isArray(updateData[key])) {
        medication[key] = { ...medication[key].toObject(), ...updateData[key] };
      } else {
        medication[key] = updateData[key];
      }
    });

    await medication.save();
    logger.info(`Medication updated: ${medicationId} by ${accountId}`);
    return medication;
  }

  /**
   * Refill a medication
   */
  async refill(medicationId, accountId, newQuantity) {
    const medication = await Medication.findById(medicationId);
    if (!medication) throw new Error('Medication not found');

    medication.refill(newQuantity);
    await medication.save();
    logger.info(`Medication refilled: ${medicationId}, new quantity: ${newQuantity}`);
    return medication;
  }

  /**
   * Deactivate (soft delete) a medication
   */
  async deactivate(medicationId, accountId) {
    const medication = await Medication.findById(medicationId);
    if (!medication) throw new Error('Medication not found');

    medication.isActive = false;
    medication.deactivatedAt = new Date();
    await medication.save();
    logger.info(`Medication deactivated: ${medicationId} by ${accountId}`);
    return { success: true };
  }

  /**
   * Get medications that need refill soon
   * @param {String} patientId - Patient ID
   */
  async getRefillNeeded(patientId) {
    const medications = await Medication.find({
      patientId,
      isActive: true
    }).populate('pharmacyId', 'pharmacyName phone');

    return medications.filter(med => med.isRefillNeededSoon);
  }

  /**
   * Get medications expiring soon (within 30 days)
   */
  async getExpiringSoon(patientId) {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return Medication.find({
      patientId,
      isActive: true,
      expirationDate: { $lte: thirtyDaysFromNow }
    }).populate('pharmacyId', 'pharmacyName');
  }

  /**
   * Scan medication image via OCR (STUB - requires OpenAI Vision API integration)
   * @param {String} imageBase64 - Base64 encoded image
   * @returns {Object} { name, formType, confidenceScore }
   */
  async scanImage(imageBase64) {
    // TODO: Integrate with OpenAI Vision API
    // For now, return a mock response for development

    logger.info('OCR scan requested (stub implementation)');

    // In production:
    // 1. Send image to OpenAI Vision with prompt asking for medication details
    // 2. Parse response and extract name, formType
    // 3. Return confidence score
    // 4. If confidence < 90%, return 422 error

    return {
      name: 'Unknown Medication',
      formType: 'TABLET',
      confidenceScore: 0.0,
      message: 'OCR scan is not yet implemented. Please enter medication details manually.'
    };
  }

  /**
   * Generate dose events for a medication for the next N days
   * Called by a cron job to schedule reminders
   * @param {String} medicationId - Medication ID
   * @param {Number} daysAhead - How many days ahead to generate (default 7)
   */
  async generateDoseEvents(medicationId, daysAhead = 7) {
    const medication = await Medication.findById(medicationId);
    if (!medication || !medication.isActive) return [];

    const DoseEvent = require('../../doses/models/DoseEvent.model');
    const events = [];
    const now = new Date();

    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
      const date = new Date(now);
      date.setDate(date.getDate() + dayOffset);
      date.setHours(0, 0, 0, 0);

      // Skip if before startDate
      if (date < medication.schedule.startDate) continue;
      // Skip if after endDate
      if (medication.schedule.endDate && date > medication.schedule.endDate) continue;

      // For weekly schedule, check if today's day is in daysOfWeek
      if (medication.schedule.frequency === 'WEEKLY') {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        if (!medication.schedule.daysOfWeek.includes(dayNames[date.getDay()])) continue;
      }

      // Generate events for each time of day
      for (const timeStr of medication.schedule.timesOfDay) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const scheduledFor = new Date(date);
        scheduledFor.setHours(hours, minutes, 0, 0);

        // Skip past times for today
        if (scheduledFor <= now) continue;

        // Check if event already exists
        const existing = await DoseEvent.findOne({
          medicationId,
          scheduledFor
        });

        if (!existing) {
          const event = new DoseEvent({
            medicationId,
            patientId: medication.patientId,
            scheduledFor,
            status: 'PENDING'
          });
          await event.save();
          events.push(event);
        }
      }
    }

    logger.info(`Generated ${events.length} dose events for medication ${medicationId}`);
    return events;
  }
}

module.exports = new MedicationService();
