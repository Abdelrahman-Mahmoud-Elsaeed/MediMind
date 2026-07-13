/**
 * Doctor Reports Service Tests — وفاء (Wafa)
 *
 * Tests the deep analytics calculations for doctor reports.
 */

const doctorReportsService = require('../../modules/doctor/services/doctorReports.service');

describe('👨‍⚕️ Doctor Reports Service', () => {

  describe('Service Configuration', () => {
    test('should instantiate without errors', () => {
      expect(doctorReportsService).toBeDefined();
      expect(typeof doctorReportsService.getFullReport).toBe('function');
      expect(typeof doctorReportsService.getPatientDetail).toBe('function');
    });
  });

  describe('Helper: _calcRate()', () => {
    test('should calculate adherence rate correctly', () => {
      const events = [
        { status: 'TAKEN' },
        { status: 'TAKEN' },
        { status: 'TAKEN' },
        { status: 'MISSED' }
      ];

      expect(doctorReportsService._calcRate(events)).toBe(75);
    });

    test('should return 0 for empty events', () => {
      expect(doctorReportsService._calcRate([])).toBe(0);
    });

    test('should return 100 for all taken', () => {
      const events = [
        { status: 'TAKEN' },
        { status: 'TAKEN' }
      ];

      expect(doctorReportsService._calcRate(events)).toBe(100);
    });
  });

  describe('Helper: _average()', () => {
    test('should calculate average correctly', () => {
      expect(doctorReportsService._average([80, 60, 100, 50])).toBe(73);
    });

    test('should return 0 for empty array', () => {
      expect(doctorReportsService._average([])).toBe(0);
    });

    test('should handle single value', () => {
      expect(doctorReportsService._average([75])).toBe(75);
    });
  });

  describe('Helper: _groupBy()', () => {
    test('should group events by patientId', () => {
      const events = [
        { patientId: 'p1', status: 'TAKEN' },
        { patientId: 'p2', status: 'TAKEN' },
        { patientId: 'p1', status: 'MISSED' }
      ];

      const grouped = doctorReportsService._groupBy(events, 'patientId');
      expect(Object.keys(grouped)).toHaveLength(2);
      expect(grouped['p1']).toHaveLength(2);
      expect(grouped['p2']).toHaveLength(1);
    });

    test('should return empty object for empty array', () => {
      const grouped = doctorReportsService._groupBy([], 'patientId');
      expect(Object.keys(grouped)).toHaveLength(0);
    });
  });

  describe('Helper: _buildCohort()', () => {
    test('should categorize patients correctly', () => {
      const breakdown = [
        { adherenceRate: 95 },  // adherent
        { adherenceRate: 85 },  // adherent
        { adherenceRate: 60 },  // moderate
        { adherenceRate: 40 },  // non-adherent
        { adherenceRate: 25 }   // non-adherent
      ];

      const cohort = doctorReportsService._buildCohort(breakdown);

      expect(cohort.adherent).toBe(2);
      expect(cohort.moderate).toBe(1);
      expect(cohort.nonAdherent).toBe(2);
    });

    test('should build adherence distribution correctly', () => {
      const breakdown = [
        { adherenceRate: 95 },  // excellent
        { adherenceRate: 75 },  // good
        { adherenceRate: 60 },  // fair
        { adherenceRate: 40 },  // poor
        { adherenceRate: 20 }   // critical
      ];

      const cohort = doctorReportsService._buildCohort(breakdown);

      expect(cohort.adherenceDistribution.excellent).toBe(1);
      expect(cohort.adherenceDistribution.good).toBe(1);
      expect(cohort.adherenceDistribution.fair).toBe(1);
      expect(cohort.adherenceDistribution.poor).toBe(1);
      expect(cohort.adherenceDistribution.critical).toBe(1);
    });

    test('should handle empty breakdown', () => {
      const cohort = doctorReportsService._buildCohort([]);

      expect(cohort.adherent).toBe(0);
      expect(cohort.moderate).toBe(0);
      expect(cohort.nonAdherent).toBe(0);
    });
  });

  describe('Helper: _buildTrend()', () => {
    test('should build trend data for 7 days', () => {
      const now = Date.now();
      const events = [
        { scheduledFor: new Date(now - 86400000), status: 'TAKEN' },
        { scheduledFor: new Date(now - 86400000), status: 'TAKEN' },
        { scheduledFor: new Date(now - 86400000), status: 'MISSED' },
        { scheduledFor: new Date(now - 2 * 86400000), status: 'TAKEN' }
      ];

      const trend = doctorReportsService._buildTrend(events, 7);

      expect(trend).toHaveLength(7);
      expect(trend[0]).toHaveProperty('date');
      expect(trend[0]).toHaveProperty('taken');
      expect(trend[0]).toHaveProperty('total');
      expect(trend[0]).toHaveProperty('rate');
    });

    test('should calculate daily rate correctly', () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);

      const events = [
        { scheduledFor: today, status: 'TAKEN' },
        { scheduledFor: today, status: 'TAKEN' },
        { scheduledFor: today, status: 'MISSED' },
        { scheduledFor: today, status: 'MISSED' }
      ];

      const trend = doctorReportsService._buildTrend(events, 1);
      expect(trend[0].rate).toBe(50);
      expect(trend[0].taken).toBe(2);
      expect(trend[0].total).toBe(4);
    });

    test('should return 0 rate for days with no events', () => {
      const trend = doctorReportsService._buildTrend([], 7);
      trend.forEach(day => {
        expect(day.rate).toBe(0);
        expect(day.total).toBe(0);
      });
    });
  });

  describe('Helper: _calcTrendDirection()', () => {
    test('should return IMPROVING when recent rate > previous rate', () => {
      const now = Date.now();
      const events = [
        // Last 7 days: 100% adherence
        { scheduledFor: new Date(now - 1 * 86400000), status: 'TAKEN' },
        { scheduledFor: new Date(now - 2 * 86400000), status: 'TAKEN' },
        { scheduledFor: new Date(now - 3 * 86400000), status: 'TAKEN' },
        // Previous 7 days: 33% adherence
        { scheduledFor: new Date(now - 10 * 86400000), status: 'TAKEN' },
        { scheduledFor: new Date(now - 11 * 86400000), status: 'MISSED' },
        { scheduledFor: new Date(now - 12 * 86400000), status: 'MISSED' }
      ];

      const direction = doctorReportsService._calcTrendDirection(events);
      expect(direction).toBe('IMPROVING');
    });

    test('should return DECLINING when recent rate < previous rate', () => {
      const now = Date.now();
      const events = [
        // Last 7 days: 0% adherence
        { scheduledFor: new Date(now - 1 * 86400000), status: 'MISSED' },
        { scheduledFor: new Date(now - 2 * 86400000), status: 'MISSED' },
        // Previous 7 days: 100% adherence
        { scheduledFor: new Date(now - 10 * 86400000), status: 'TAKEN' },
        { scheduledFor: new Date(now - 11 * 86400000), status: 'TAKEN' }
      ];

      const direction = doctorReportsService._calcTrendDirection(events);
      expect(direction).toBe('DECLINING');
    });

    test('should return STABLE when rates are similar', () => {
      const now = Date.now();
      const events = [
        // Last 7 days: 50%
        { scheduledFor: new Date(now - 1 * 86400000), status: 'TAKEN' },
        { scheduledFor: new Date(now - 2 * 86400000), status: 'MISSED' },
        // Previous 7 days: 50%
        { scheduledFor: new Date(now - 10 * 86400000), status: 'TAKEN' },
        { scheduledFor: new Date(now - 11 * 86400000), status: 'MISSED' }
      ];

      const direction = doctorReportsService._calcTrendDirection(events);
      expect(direction).toBe('STABLE');
    });
  });

  describe('Helper: _buildTimeAnalysis()', () => {
    test('should categorize doses by time of day', () => {
      const events = [
        { scheduledFor: new Date('2026-01-01T08:00:00'), status: 'TAKEN' },   // morning
        { scheduledFor: new Date('2026-01-01T13:00:00'), status: 'MISSED' },  // noon
        { scheduledFor: new Date('2026-01-01T18:00:00'), status: 'TAKEN' },   // evening
        { scheduledFor: new Date('2026-01-01T22:00:00'), status: 'TAKEN' },   // night
        { scheduledFor: new Date('2026-01-01T03:00:00'), status: 'MISSED' }   // dawn
      ];

      const analysis = doctorReportsService._buildTimeAnalysis(events);

      expect(analysis).toHaveLength(5);

      const morning = analysis.find(a => a.slot === 'morning');
      expect(morning.taken).toBe(1);
      expect(morning.total).toBe(1);
      expect(morning.adherenceRate).toBe(100);

      const noon = analysis.find(a => a.slot === 'noon');
      expect(noon.taken).toBe(0);
      expect(noon.total).toBe(1);
      expect(noon.adherenceRate).toBe(0);

      const night = analysis.find(a => a.slot === 'night');
      expect(night.taken).toBe(1);
      expect(night.adherenceRate).toBe(100);
    });

    test('should return 0 rate for empty events', () => {
      const analysis = doctorReportsService._buildTimeAnalysis([]);

      analysis.forEach(slot => {
        expect(slot.adherenceRate).toBe(0);
        expect(slot.total).toBe(0);
      });
    });
  });

  describe('Helper: _buildHeatmap()', () => {
    test('should build 7x24 heatmap', () => {
      const events = [
        { scheduledFor: new Date('2026-01-04T08:00:00'), status: 'MISSED' }, // Sunday 8am
        { scheduledFor: new Date('2026-01-05T20:00:00'), status: 'MISSED' }, // Monday 8pm
        { scheduledFor: new Date('2026-01-04T08:00:00'), status: 'MISSED' }, // Sunday 8am again
      ];

      const heatmap = doctorReportsService._buildHeatmap(events);

      expect(heatmap.data).toHaveLength(7); // 7 days
      heatmap.data.forEach(row => {
        expect(row).toHaveLength(24); // 24 hours
      });
      // Sunday (0) at 8am should have 2 misses
      expect(heatmap.data[0][8]).toBe(2);
      // Monday (1) at 8pm (20) should have 1 miss
      expect(heatmap.data[1][20]).toBe(1);
    });

    test('should return zero-filled heatmap for empty events', () => {
      const heatmap = doctorReportsService._buildHeatmap([]);

      heatmap.data.forEach(row => {
        row.forEach(val => {
          expect(val).toBe(0);
        });
      });
    });
  });
});
