/**
 * Adherence Prediction Service Tests — وفاء (Wafa)
 *
 * Tests the adherence risk prediction logic.
 * Tests the helper methods that don't require DB.
 */

const mongoose = require('mongoose');
const predictionService = require('../../modules/ai/services/adherencePrediction.service');

// Reduce mongoose buffering timeout
beforeAll(() => {
  mongoose.set('bufferTimeoutMS', 100);
});

describe('🤖 Adherence Prediction Service', () => {

  describe('Service Configuration', () => {
    test('should instantiate without errors', () => {
      expect(predictionService).toBeDefined();
      expect(typeof predictionService.predictAdherenceRisk).toBe('function');
    });
  });

  describe('_getRiskLevel()', () => {
    test('should return LOW for score <= 20', () => {
      expect(predictionService._getRiskLevel(0)).toBe('LOW');
      expect(predictionService._getRiskLevel(10)).toBe('LOW');
      expect(predictionService._getRiskLevel(20)).toBe('LOW');
    });

    test('should return MODERATE for score 21-50', () => {
      expect(predictionService._getRiskLevel(21)).toBe('MODERATE');
      expect(predictionService._getRiskLevel(35)).toBe('MODERATE');
      expect(predictionService._getRiskLevel(50)).toBe('MODERATE');
    });

    test('should return HIGH for score 51-75', () => {
      expect(predictionService._getRiskLevel(51)).toBe('HIGH');
      expect(predictionService._getRiskLevel(60)).toBe('HIGH');
      expect(predictionService._getRiskLevel(75)).toBe('HIGH');
    });

    test('should return CRITICAL for score > 75', () => {
      expect(predictionService._getRiskLevel(76)).toBe('CRITICAL');
      expect(predictionService._getRiskLevel(90)).toBe('CRITICAL');
      expect(predictionService._getRiskLevel(100)).toBe('CRITICAL');
    });
  });

  describe('_calculateComplexityScore()', () => {
    test('should return low score for 1-2 medications', () => {
      const meds = [
        { schedule: { dosesPerDay: 1 } },
        { schedule: { dosesPerDay: 2 } }
      ];
      const result = predictionService._calculateComplexityScore(meds);
      expect(result.score).toBeLessThanOrEqual(5);
    });

    test('should return medium score for 3-4 medications', () => {
      const meds = [
        { schedule: { dosesPerDay: 1 } },
        { schedule: { dosesPerDay: 2 } },
        { schedule: { dosesPerDay: 3 } }
      ];
      const result = predictionService._calculateComplexityScore(meds);
      expect(result.score).toBeGreaterThanOrEqual(5);
    });

    test('should return high score for 5+ medications', () => {
      const meds = Array(5).fill(null).map(() => ({ schedule: { dosesPerDay: 2 } }));
      const result = predictionService._calculateComplexityScore(meds);
      expect(result.score).toBeGreaterThanOrEqual(8);
    });

    test('should cap score at 10', () => {
      const meds = Array(20).fill(null).map(() => ({ schedule: { dosesPerDay: 6 } }));
      const result = predictionService._calculateComplexityScore(meds);
      expect(result.score).toBeLessThanOrEqual(10);
    });

    test('should return 0 for empty medications', () => {
      const result = predictionService._calculateComplexityScore([]);
      expect(result.score).toBe(0);
    });
  });

  describe('_analyzeDayOfWeekPattern()', () => {
    test('should detect weekend pattern', () => {
      // Create events where Friday and Saturday have high miss rate
      const events = [];

      // Weekdays: 20 events, 2 missed (10%)
      for (let i = 0; i < 18; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(8, 0, 0, 0);
        // Adjust to a weekday
        while (date.getDay() === 5 || date.getDay() === 6) {
          date.setDate(date.getDate() - 1);
        }
        events.push({ scheduledFor: date, status: 'TAKEN' });
      }
      for (let i = 0; i < 2; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i - 30);
        date.setHours(8, 0, 0, 0);
        while (date.getDay() === 5 || date.getDay() === 6) {
          date.setDate(date.getDate() - 1);
        }
        events.push({ scheduledFor: date, status: 'MISSED' });
      }

      // Weekends: 10 events, 5 missed (50%)
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i * 7);
        date.setHours(8, 0, 0, 0);
        // Adjust to Friday
        while (date.getDay() !== 5) {
          date.setDate(date.getDate() - 1);
        }
        events.push({ scheduledFor: date, status: 'TAKEN' });
      }
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i * 7 - 7);
        date.setHours(8, 0, 0, 0);
        while (date.getDay() !== 5) {
          date.setDate(date.getDate() - 1);
        }
        events.push({ scheduledFor: date, status: 'MISSED' });
      }

      const result = predictionService._analyzeDayOfWeekPattern(events);
      expect(result.score).toBeGreaterThan(0);
    });

    test('should return low score for stable pattern', () => {
      const events = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(8, 0, 0, 0);
        events.push({ scheduledFor: date, status: 'TAKEN' });
      }

      const result = predictionService._analyzeDayOfWeekPattern(events);
      expect(result.score).toBeLessThan(5);
    });

    test('should handle empty events', () => {
      const result = predictionService._analyzeDayOfWeekPattern([]);
      expect(result.score).toBe(0);
    });
  });

  describe('_analyzeTimeOfDayPattern()', () => {
    test('should detect morning miss pattern', () => {
      const events = [];
      // 10 morning events, 5 missed (50%)
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(8, 0, 0, 0); // morning
        events.push({ scheduledFor: date, status: 'TAKEN' });
      }
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i - 5);
        date.setHours(8, 0, 0, 0);
        events.push({ scheduledFor: date, status: 'MISSED' });
      }
      // 10 evening events, all taken
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(20, 0, 0, 0); // evening
        events.push({ scheduledFor: date, status: 'TAKEN' });
      }

      const result = predictionService._analyzeTimeOfDayPattern(events);
      expect(result.score).toBeGreaterThan(0);
      expect(result.description).toContain('الصباح');
    });

    test('should return low score for stable pattern', () => {
      const events = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(8, 0, 0, 0);
        events.push({ scheduledFor: date, status: 'TAKEN' });
      }

      const result = predictionService._analyzeTimeOfDayPattern(events);
      expect(result.score).toBeLessThan(5);
    });
  });

  describe('_generatePredictions()', () => {
    test('should generate predictions for 7 days', async () => {
      const events = [];
      for (let i = 0; i < 14; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(8, 0, 0, 0);
        events.push({ scheduledFor: date, status: i % 3 === 0 ? 'MISSED' : 'TAKEN' });
      }

      const predictions = await predictionService._generatePredictions(
        new mongoose.Types.ObjectId(),
        events,
        7
      );

      expect(predictions).toHaveLength(7);
      predictions.forEach(p => {
        expect(p).toHaveProperty('date');
        expect(p).toHaveProperty('dayName');
        expect(p).toHaveProperty('missProbability');
        expect(p).toHaveProperty('riskLevel');
        expect(p.missProbability).toBeGreaterThanOrEqual(0);
        expect(p.missProbability).toBeLessThanOrEqual(100);
      });

      // First prediction should be today
      expect(predictions[0].isToday).toBe(true);
      expect(predictions[1].isTomorrow).toBe(true);
    });

    test('should handle empty events with default probability', async () => {
      const predictions = await predictionService._generatePredictions(
        new mongoose.Types.ObjectId(),
        [],
        7
      );

      expect(predictions).toHaveLength(7);
      // With no data, default miss probability is 20%
      expect(predictions[0].missProbability).toBe(20);
    });
  });

  describe('_generateRecommendations()', () => {
    test('should generate LOW risk recommendation', () => {
      const factors = [
        { name: 'نسبة الالتزام', score: 5, maxScore: 40, description: 'ممتاز' }
      ];
      const predictions = [{ riskLevel: 'LOW', dayName: 'السبت' }];

      const recs = predictionService._generateRecommendations('LOW', factors, predictions);
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].priority).toBe('INFO');
    });

    test('should generate CRITICAL risk recommendation', () => {
      const factors = [
        { name: 'نسبة الالتزام', score: 35, maxScore: 40, description: 'سيء' }
      ];
      const predictions = [{ riskLevel: 'CRITICAL', dayName: 'السبت' }];

      const recs = predictionService._generateRecommendations('CRITICAL', factors, predictions);
      expect(recs.some(r => r.priority === 'CRITICAL')).toBe(true);
    });

    test('should include day-specific recommendation for high-risk days', () => {
      const factors = [];
      const predictions = [
        { riskLevel: 'HIGH', dayName: 'الجمعة', missProbability: 60 },
        { riskLevel: 'LOW', dayName: 'السبت', missProbability: 10 }
      ];

      const recs = predictionService._generateRecommendations('MODERATE', factors, predictions);
      expect(recs.some(r => r.title.includes('أيام') && r.title.includes('高风险'))).toBe(true);
    });
  });

  describe('predictAdherenceRisk() — DB dependent', () => {
    test('should return a promise', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = predictionService.predictAdherenceRisk(fakeId, 7);
      expect(result).toBeInstanceOf(Promise);
      await result.catch(() => {}); // prevent unhandled rejection
    });
  });
});
