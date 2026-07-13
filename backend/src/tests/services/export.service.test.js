/**
 * Export Service Tests — وفاء (Wafa)
 *
 * Tests the export service configuration and report structure.
 * DB-dependent methods are tested for being async (require MongoDB for actual data).
 */

const mongoose = require('mongoose');
const exportService = require('../../modules/export/services/export.service');

// Reduce mongoose buffering timeout for tests
beforeAll(() => {
  mongoose.set('bufferTimeoutMS', 100);
});

describe('📄 Export Service', () => {

  describe('Service Configuration', () => {
    test('should instantiate without errors', () => {
      expect(exportService).toBeDefined();
    });

    test('should have all required methods', () => {
      expect(typeof exportService.generatePatientReportHTML).toBe('function');
      expect(typeof exportService.generatePatientReportCSV).toBe('function');
      expect(typeof exportService.generateDoctorReportCSV).toBe('function');
    });
  });

  describe('DB-dependent methods (require MongoDB)', () => {
    test('generatePatientReportHTML should be async', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = exportService.generatePatientReportHTML(fakeId, 30);
      expect(result).toBeInstanceOf(Promise);
      await result.catch(() => {}); // prevent unhandled rejection
    });

    test('generatePatientReportCSV should be async', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = exportService.generatePatientReportCSV(fakeId, 30);
      expect(result).toBeInstanceOf(Promise);
      await result.catch(() => {});
    });

    test('generateDoctorReportCSV should be async', async () => {
      const fakeAccountId = new mongoose.Types.ObjectId();
      const result = exportService.generateDoctorReportCSV(fakeAccountId, 30);
      expect(result).toBeInstanceOf(Promise);
      await result.catch(() => {});
    });
  });

  describe('_buildDailyBreakdown() helper', () => {
    test('should build daily breakdown for 7 days', () => {
      const now = Date.now();
      const events = [
        { scheduledFor: new Date(now - 1 * 86400000), status: 'TAKEN' },
        { scheduledFor: new Date(now - 1 * 86400000), status: 'MISSED' },
        { scheduledFor: new Date(now - 2 * 86400000), status: 'TAKEN' }
      ];

      const breakdown = exportService._buildDailyBreakdown(events, 7);
      expect(breakdown).toHaveLength(7);
      expect(breakdown[0]).toHaveProperty('date');
      expect(breakdown[0]).toHaveProperty('dayName');
      expect(breakdown[0]).toHaveProperty('taken');
      expect(breakdown[0]).toHaveProperty('total');
      expect(breakdown[0]).toHaveProperty('rate');
    });

    test('should calculate daily rate correctly', () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);

      const events = [
        { scheduledFor: today, status: 'TAKEN' },
        { scheduledFor: today, status: 'TAKEN' },
        { scheduledFor: today, status: 'MISSED' }
      ];

      const breakdown = exportService._buildDailyBreakdown(events, 1);
      expect(breakdown[0].rate).toBe(67); // 2/3 = 67%
    });

    test('should handle empty events', () => {
      const breakdown = exportService._buildDailyBreakdown([], 7);
      breakdown.forEach(day => {
        expect(day.rate).toBe(0);
        expect(day.total).toBe(0);
      });
    });
  });

  describe('_buildHTMLReport() helper', () => {
    test('should generate valid HTML with patient data', () => {
      const data = {
        patient: {
          firstName: 'محمد',
          lastName: 'أحمد',
          phone: '+201234567890',
          dateOfBirth: new Date('1960-01-01'),
          bloodType: 'O+'
        },
        period: 30,
        startDate: new Date(Date.now() - 30 * 86400000),
        endDate: new Date(),
        summary: {
          taken: 50,
          missed: 10,
          skipped: 5,
          total: 65,
          adherenceRate: 77
        },
        dailyBreakdown: [
          { date: '2026-01-01', dayName: 'الإثنين', taken: 2, total: 3, rate: 67 }
        ],
        medStats: [
          { name: 'Glucophage', formType: 'TABLET', isChronic: true, taken: 30, missed: 5, total: 35, rate: 86 }
        ]
      };

      const html = exportService._buildHTMLReport(data);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('محمد أحمد');
      expect(html).toContain('+201234567890');
      expect(html).toContain('77%');
      expect(html).toContain('Glucophage');
      expect(html).toContain('font-family: \'Cairo\'');
      expect(html).toContain('dir="rtl"');
    });

    test('should color-code adherence based on rate', () => {
      // Poor adherence (< 50%)
      const poorHtml = exportService._buildHTMLReport({
        patient: { firstName: 'T', lastName: 'T', phone: 'T' },
        period: 30,
        startDate: new Date(),
        endDate: new Date(),
        summary: { taken: 10, missed: 30, skipped: 0, total: 40, adherenceRate: 25 },
        dailyBreakdown: [],
        medStats: []
      });
      expect(poorHtml).toContain('#EF4444'); // red

      // Excellent adherence (>= 80%)
      const goodHtml = exportService._buildHTMLReport({
        patient: { firstName: 'T', lastName: 'T', phone: 'T' },
        period: 30,
        startDate: new Date(),
        endDate: new Date(),
        summary: { taken: 40, missed: 5, skipped: 0, total: 45, adherenceRate: 89 },
        dailyBreakdown: [],
        medStats: []
      });
      expect(goodHtml).toContain('#10B981'); // green
    });
  });
});
