// worker/src/jobs/generateDoses.job.js
const mongoose = require('../../../backend/node_modules/mongoose');
const { logger } = require('../shared/logger');

require('../../../backend/src/modules/medications/models/Medication.model');
require('../../../backend/src/modules/doses/models/DoseEvent.model');
require('../../../backend/src/modules/conditions/models/MedicalCondition.model');

const Medication = mongoose.model('Medication');
const DoseEvent = mongoose.model('DoseEvent');

/**
 * Generate Dose Events Job — runs every hour
 *
 * Scans all active medications and generates DoseEvent records for the next 24 hours.
 * This is more efficient than running per-medication.
 */
async function runGenerateDosesJob() {
  const startTime = Date.now();
  try {
    logger.debug('🔄 Generate doses job started...');

    // Find all active medications
    const medications = await Medication.find({ isActive: true })
      .limit(1000); // Process in batches

    let totalGenerated = 0;
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    for (const medication of medications) {
      try {
        // Skip if medication is expired
        if (medication.expirationDate && medication.expirationDate < now) continue;

        // Skip if before start date
        if (medication.schedule.startDate > tomorrow) continue;

        // Skip if after end date (for non-chronic)
        if (medication.schedule.endDate && medication.schedule.endDate < now) continue;

        // Generate events for each time slot for the next 24 hours
        for (let dayOffset = 0; dayOffset < 2; dayOffset++) {
          const date = new Date(now);
          date.setDate(date.getDate() + dayOffset);
          date.setHours(0, 0, 0, 0);

          // For weekly schedule, check day of week
          if (medication.schedule.frequency === 'WEEKLY') {
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            if (!medication.schedule.daysOfWeek?.includes(dayNames[date.getDay()])) continue;
          }

          for (const timeStr of medication.schedule.timesOfDay) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            const scheduledFor = new Date(date);
            scheduledFor.setHours(hours, minutes, 0, 0);

            // Skip past times
            if (scheduledFor <= now) continue;
            // Skip times beyond 24h
            if (scheduledFor > tomorrow) continue;

            // Determine batch group
            const batchGroup = hours < 11 ? 'morning' :
                              hours < 15 ? 'noon' :
                              hours < 19 ? 'evening' : 'night';

            // Check if event already exists
            const existing = await DoseEvent.findOne({
              medicationId: medication._id,
              scheduledFor
            });

            if (!existing) {
              const event = new DoseEvent({
                medicationId: medication._id,
                patientId: medication.patientId,
                scheduledFor,
                status: 'PENDING',
                batchGroup
              });
              await event.save();
              totalGenerated++;
            }
          }
        }
      } catch (err) {
        logger.error(`Failed to generate doses for medication ${medication._id}:`, err.message);
      }
    }

    const duration = Date.now() - startTime;
    logger.info(`✅ Generate doses job completed in ${duration}ms | Generated: ${totalGenerated}`);

    return { generated: totalGenerated };
  } catch (error) {
    logger.error('❌ Generate doses job failed:', error.message);
    throw error;
  }
}

module.exports = runGenerateDosesJob;
