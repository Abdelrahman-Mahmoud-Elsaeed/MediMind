/**
 * Smart Reminders Service Tests — وفاء (Wafa)
 *
 * Tests the smart reminder learning logic.
 * Tests helper methods that don't require DB.
 */

const mongoose = require('mongoose');
const smartRemindersService = require('../../modules/ai/services/smartReminders.service');

beforeAll(() => {
  mongoose.set('bufferTimeoutMS', 100);
});

describe('🧠 Smart Reminders Service', () => {

  describe('Service Configuration', () => {
    test('should instantiate without errors', () => {
      expect(smartRemindersService).toBeDefined();
      expect(typeof smartRemindersService.analyzePatientBehavior).toBe('function');
      expect(typeof smartRemindersService.getSmartReminderSettings).toBe('function');
    });
  });

  describe('_analyzeTimingBehavior()', () => {
    test('should detect ON_TIME pattern', () => {
      const events = [];
      // Patient takes meds within 10 min of scheduled time
      for (let i = 0; i < 10; i++) {
        const scheduled = new Date(Date.now() - i * 86400000);
        scheduled.setHours(8, 0, 0, 0);
        const taken = new Date(scheduled.getTime() + 5 * 60000); // 5 min late
        events.push({ status: 'TAKEN', scheduledFor: scheduled, takenAt: taken });
      }

      const result = smartRemindersService._analyzeTimingBehavior(events);
      expect(result.delayPattern).toBe('ON_TIME');
      expect(result.timingAccuracy).toBeGreaterThan(80);
    });

    test('should detect LATE pattern', () => {
      const events = [];
      for (let i = 0; i < 10; i++) {
        const scheduled = new Date(Date.now() - i * 86400000);
        scheduled.setHours(8, 0, 0, 0);
        const taken = new Date(scheduled.getTime() + 45 * 60000); // 45 min late
        events.push({ status: 'TAKEN', scheduledFor: scheduled, takenAt: taken });
      }

      const result = smartRemindersService._analyzeTimingBehavior(events);
      expect(result.delayPattern).toBe('LATE');
      expect(result.averageDelayMinutes).toBeGreaterThan(30);
    });

    test('should detect EARLY pattern', () => {
      const events = [];
      for (let i = 0; i < 10; i++) {
        const scheduled = new Date(Date.now() - i * 86400000);
        scheduled.setHours(8, 0, 0, 0);
        const taken = new Date(scheduled.getTime() - 20 * 60000); // 20 min early
        events.push({ status: 'TAKEN', scheduledFor: scheduled, takenAt: taken });
      }

      const result = smartRemindersService._analyzeTimingBehavior(events);
      expect(result.delayPattern).toBe('EARLY');
      expect(result.averageDelayMinutes).toBeLessThan(-10);
    });

    test('should handle empty events', () => {
      const result = smartRemindersService._analyzeTimingBehavior([]);
      expect(result.delayPattern).toBe('NO_DATA');
      expect(result.averageDelayMinutes).toBe(0);
    });

    test('should handle events without takenAt', () => {
      const events = [
        { status: 'MISSED', scheduledFor: new Date(), takenAt: null },
        { status: 'PENDING', scheduledFor: new Date(), takenAt: null }
      ];
      const result = smartRemindersService._analyzeTimingBehavior(events);
      expect(result.delayPattern).toBe('NO_DATA');
    });
  });

  describe('_analyzeByTimeSlot()', () => {
    test('should categorize events by time of day', () => {
      const events = [];
      // Morning at 8am
      const morningDate = new Date();
      morningDate.setHours(8, 0, 0, 0);
      events.push({
        scheduledFor: morningDate,
        takenAt: new Date(morningDate.getTime() + 10 * 60000),
        status: 'TAKEN'
      });
      // Evening at 5pm (17:00) — falls in evening slot (15-19)
      const eveningDate = new Date();
      eveningDate.setHours(17, 0, 0, 0);
      events.push({
        scheduledFor: eveningDate,
        takenAt: new Date(eveningDate.getTime() + 30 * 60000),
        status: 'TAKEN'
      });

      const result = smartRemindersService._analyzeByTimeSlot(events);
      expect(result.morning).toBeDefined();
      expect(result.evening).toBeDefined();
      expect(result.morning.count).toBe(1);
      expect(result.evening.count).toBe(1);
    });
  });

  describe('_detectPatterns()', () => {
    test('should detect WEEKEND_STRUGGLE pattern', () => {
      const events = [];

      // Weekdays: 20 events, all taken
      for (let i = 0; i < 20; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(8, 0, 0, 0);
        // Adjust to a weekday
        while (date.getDay() === 5 || date.getDay() === 6) {
          date.setDate(date.getDate() - 1);
        }
        events.push({ scheduledFor: date, status: 'TAKEN' });
      }

      // Weekends: 10 events, 8 missed (80% miss rate)
      for (let i = 0; i < 8; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i * 7 - 7);
        date.setHours(8, 0, 0, 0);
        while (date.getDay() !== 5) {
          date.setDate(date.getDate() - 1);
        }
        events.push({ scheduledFor: date, status: 'MISSED' });
      }
      for (let i = 0; i < 2; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i * 7 - 14);
        date.setHours(8, 0, 0, 0);
        while (date.getDay() !== 5) {
          date.setDate(date.getDate() - 1);
        }
        events.push({ scheduledFor: date, status: 'TAKEN' });
      }

      const patterns = smartRemindersService._detectPatterns(events);
      expect(patterns.weekendVsWeekday).toBeDefined();
      expect(patterns.weekendVsWeekday.pattern).toBe('WEEKEND_STRUGGLE');
    });

    test('should detect worst day', () => {
      const events = [];
      // Create 10 events on Friday, 8 missed
      for (let i = 0; i < 8; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i * 7 - 7);
        date.setHours(8, 0, 0, 0);
        while (date.getDay() !== 5) {
          date.setDate(date.getDate() - 1);
        }
        events.push({ scheduledFor: date, status: 'MISSED' });
      }
      for (let i = 0; i < 2; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i * 7 - 14);
        date.setHours(8, 0, 0, 0);
        while (date.getDay() !== 5) {
          date.setDate(date.getDate() - 1);
        }
        events.push({ scheduledFor: date, status: 'TAKEN' });
      }

      const patterns = smartRemindersService._detectPatterns(events);
      expect(patterns.worstDay).toBeDefined();
      expect(patterns.worstDay.day).toBe('الجمعة');
    });

    test('should detect improving trend', () => {
      const events = [];
      const now = Date.now();

      // Previous 7 days: 50% adherence
      for (let i = 7; i < 14; i++) {
        const date = new Date(now - i * 86400000);
        events.push({ scheduledFor: date, status: i % 2 === 0 ? 'TAKEN' : 'MISSED' });
      }

      // Last 7 days: 100% adherence
      for (let i = 0; i < 7; i++) {
        const date = new Date(now - i * 86400000);
        events.push({ scheduledFor: date, status: 'TAKEN' });
      }

      const patterns = smartRemindersService._detectPatterns(events);
      expect(patterns.trendDirection).toBe('IMPROVING');
    });

    test('should detect declining trend', () => {
      const events = [];
      const now = Date.now();

      // Previous 7 days: 100% adherence
      for (let i = 7; i < 14; i++) {
        const date = new Date(now - i * 86400000);
        events.push({ scheduledFor: date, status: 'TAKEN' });
      }

      // Last 7 days: 30% adherence
      for (let i = 0; i < 7; i++) {
        const date = new Date(now - i * 86400000);
        events.push({ scheduledFor: date, status: i % 3 === 0 ? 'TAKEN' : 'MISSED' });
      }

      const patterns = smartRemindersService._detectPatterns(events);
      expect(patterns.trendDirection).toBe('DECLINING');
    });
  });

  describe('_generateScheduleSuggestions()', () => {
    test('should suggest timing adjustment for late patient', () => {
      const events = [];
      for (let i = 0; i < 10; i++) {
        const scheduled = new Date(Date.now() - i * 86400000);
        scheduled.setHours(8, 0, 0, 0);
        const taken = new Date(scheduled.getTime() + 45 * 60000); // 45 min late
        events.push({ status: 'TAKEN', scheduledFor: scheduled, takenAt: taken });
      }

      const patterns = smartRemindersService._detectPatterns(events);
      const suggestions = smartRemindersService._generateScheduleSuggestions(events, patterns);

      const timingSuggestion = suggestions.find(s => s.type === 'TIMING_ADJUSTMENT');
      expect(timingSuggestion).toBeDefined();
      expect(timingSuggestion.priority).toBe('MEDIUM');
    });

    test('should suggest weekend boost for weekend struggler', () => {
      const events = [];
      // Create weekend struggle pattern
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i * 7);
        date.setHours(8, 0, 0, 0);
        while (date.getDay() !== 5) {
          date.setDate(date.getDate() - 1);
        }
        events.push({ scheduledFor: date, status: i < 8 ? 'MISSED' : 'TAKEN' });
      }
      // Add some weekday events
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(8, 0, 0, 0);
        while (date.getDay() === 5 || date.getDay() === 6) {
          date.setDate(date.getDate() - 1);
        }
        events.push({ scheduledFor: date, status: 'TAKEN' });
      }

      const patterns = smartRemindersService._detectPatterns(events);
      const suggestions = smartRemindersService._generateScheduleSuggestions(events, patterns);

      const weekendSuggestion = suggestions.find(s => s.type === 'WEEKEND_BOOST');
      expect(weekendSuggestion).toBeDefined();
    });
  });

  describe('_recommendReminderFrequency()', () => {
    test('should recommend MINIMAL for highly adherent patient', () => {
      const events = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date(Date.now() - i * 86400000);
        events.push({ scheduledFor: date, status: 'TAKEN' });
      }
      const patterns = { trendDirection: 'STABLE' };

      const result = smartRemindersService._recommendReminderFrequency(events, patterns);
      expect(result.frequency).toBe('MINIMAL');
      expect(result.extraReminders).toBe(0);
    });

    test('should recommend INTENSIVE for low adherence', () => {
      const events = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date(Date.now() - i * 86400000);
        events.push({ scheduledFor: date, status: i % 3 === 0 ? 'TAKEN' : 'MISSED' });
      }
      const patterns = { trendDirection: 'STABLE' };

      const result = smartRemindersService._recommendReminderFrequency(events, patterns);
      expect(result.frequency).toBe('INTENSIVE');
      expect(result.extraReminders).toBeGreaterThanOrEqual(2);
    });

    test('should boost frequency for declining trend', () => {
      const events = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date(Date.now() - i * 86400000);
        events.push({ scheduledFor: date, status: i % 2 === 0 ? 'TAKEN' : 'MISSED' });
      }
      const patterns = { trendDirection: 'DECLINING' };

      const result = smartRemindersService._recommendReminderFrequency(events, patterns);
      expect(result.extraReminders).toBeGreaterThanOrEqual(1);
    });
  });

  describe('_calculateConfidence()', () => {
    test('should return high confidence for 10+ data points and large delay', () => {
      const confidence = smartRemindersService._calculateConfidence(10, 60);
      expect(confidence).toBe(100);
    });

    test('should return low confidence for few data points', () => {
      const confidence = smartRemindersService._calculateConfidence(3, 20);
      expect(confidence).toBeLessThan(50);
    });

    test('should cap at 100', () => {
      const confidence = smartRemindersService._calculateConfidence(50, 120);
      expect(confidence).toBe(100);
    });
  });

  describe('_median()', () => {
    test('should calculate median for odd array', () => {
      expect(smartRemindersService._median([1, 3, 5, 7, 9])).toBe(5);
    });

    test('should calculate median for even array', () => {
      expect(smartRemindersService._median([1, 3, 5, 7])).toBe(4);
    });

    test('should handle single element', () => {
      expect(smartRemindersService._median([42])).toBe(42);
    });
  });

  describe('_buildAdjustedTimings()', () => {
    test('should suggest earlier time for consistently late patient', () => {
      const events = [];
      const medId = new mongoose.Types.ObjectId();
      for (let i = 0; i < 10; i++) {
        const scheduled = new Date();
        scheduled.setDate(scheduled.getDate() - i);
        scheduled.setHours(8, 0, 0, 0);
        const taken = new Date(scheduled.getTime() + 40 * 60000); // 40 min late

        events.push({
          medicationId: { _id: medId, name: 'Test Drug' },
          scheduledFor: scheduled,
          takenAt: taken,
          status: 'TAKEN'
        });
      }

      const timingAnalysis = smartRemindersService._analyzeTimingBehavior(events);
      const adjusted = smartRemindersService._buildAdjustedTimings(events, timingAnalysis);

      expect(adjusted.length).toBeGreaterThan(0);
      expect(adjusted[0].averageDelayMinutes).toBeGreaterThan(30);
      expect(adjusted[0].direction).toBe('EARLIER');
    });

    test('should not suggest adjustment for on-time patient', () => {
      const events = [];
      const medId = new mongoose.Types.ObjectId();
      for (let i = 0; i < 10; i++) {
        const scheduled = new Date();
        scheduled.setDate(scheduled.getDate() - i);
        scheduled.setHours(8, 0, 0, 0);
        const taken = new Date(scheduled.getTime() + 5 * 60000); // 5 min late

        events.push({
          medicationId: { _id: medId, name: 'Test Drug' },
          scheduledFor: scheduled,
          takenAt: taken,
          status: 'TAKEN'
        });
      }

      const timingAnalysis = smartRemindersService._analyzeTimingBehavior(events);
      const adjusted = smartRemindersService._buildAdjustedTimings(events, timingAnalysis);

      expect(adjusted.length).toBe(0);
    });
  });

  describe('analyzePatientBehavior() — DB dependent', () => {
    test('should return a promise', () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = smartRemindersService.analyzePatientBehavior(fakeId);
      expect(result).toBeInstanceOf(Promise);
      result.catch(() => {}); // prevent unhandled rejection
    });
  });

  describe('getSmartReminderSettings() — DB dependent', () => {
    test('should return a promise', () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = smartRemindersService.getSmartReminderSettings(fakeId);
      expect(result).toBeInstanceOf(Promise);
      result.catch(() => {});
    });
  });
});
