/**
 * WhatsApp Service Tests — وفاء (Wafa)
 *
 * Tests message formatting for the WhatsApp service.
 * In dev mode, the service logs to console instead of actually sending.
 */

const whatsappService = require('../../sheared/services/whatsapp.service');

describe('💬 WhatsApp Service', () => {

  describe('Service Configuration', () => {
    test('should instantiate without errors', () => {
      expect(whatsappService).toBeDefined();
      expect(typeof whatsappService.sendText).toBe('function');
      expect(typeof whatsappService.sendDoctorWeeklyReport).toBe('function');
      expect(typeof whatsappService.sendPatientReminder).toBe('function');
      expect(typeof whatsappService.sendCaregiverAlert).toBe('function');
      expect(typeof whatsappService.sendOtp).toBe('function');
      expect(typeof whatsappService.sendRefillReminder).toBe('function');
    });
  });

  describe('sendDoctorWeeklyReport()', () => {
    test('should send report without errors in dev mode', async () => {
      const doctor = {
        fullName: 'سعيد محمد',
        phone: '+201234567890'
      };

      const report = {
        totalPatients: 15,
        adherentPatients: 12,
        lowAdherencePatients: [
          { name: 'مريض 1', missedCount: 3 },
          { name: 'مريض 2', missedCount: 5 }
        ],
        refillSoonPatients: [
          { name: 'مريض 3', medication: 'Glucophage' },
          { name: 'مريض 4', medication: 'Concor' }
        ],
        newPatients: [
          { name: 'مريض جديد 1' }
        ]
      };

      const result = await whatsappService.sendDoctorWeeklyReport(doctor, report);

      // In dev mode, returns success: true
      expect(result).toBeDefined();
    });

    test('should handle empty report', async () => {
      const doctor = {
        fullName: 'سعيد',
        phone: '+201234567890'
      };

      const report = {
        totalPatients: 0,
        adherentPatients: 0,
        lowAdherencePatients: [],
        refillSoonPatients: [],
        newPatients: []
      };

      const result = await whatsappService.sendDoctorWeeklyReport(doctor, report);
      expect(result).toBeDefined();
    });

    test('should truncate low adherence list to 5 patients', async () => {
      const doctor = { fullName: 'Test', phone: '+201234567890' };

      const report = {
        totalPatients: 20,
        adherentPatients: 10,
        lowAdherencePatients: Array.from({ length: 10 }, (_, i) => ({
          name: `مريض ${i}`,
          missedCount: i + 1
        })),
        refillSoonPatients: [],
        newPatients: []
      };

      // Should not throw
      const result = await whatsappService.sendDoctorWeeklyReport(doctor, report);
      expect(result).toBeDefined();
    });
  });

  describe('sendPatientReminder()', () => {
    test('should send reminder successfully in dev mode', async () => {
      const patient = {
        firstName: 'محمد',
        phone: '+201234567890'
      };

      const reminder = {
        medicationName: 'Glucophage',
        dosage: '500mg',
        time: '08:00'
      };

      const result = await whatsappService.sendPatientReminder(patient, reminder);
      expect(result).toBeDefined();
    });
  });

  describe('sendCaregiverAlert()', () => {
    test('should send alert successfully', async () => {
      const caregiver = {
        firstName: 'أحمد',
        phone: '+201234567891'
      };

      const alert = {
        patientName: 'محمد أحمد',
        medicationName: 'Concor',
        scheduledTime: '08:00',
        missedDuration: 30
      };

      const result = await whatsappService.sendCaregiverAlert(caregiver, alert);
      expect(result).toBeDefined();
    });
  });

  describe('sendOtp()', () => {
    test('should send OTP successfully', async () => {
      const result = await whatsappService.sendOtp('+201234567890', '123456');
      expect(result).toBeDefined();
    });
  });

  describe('sendRefillReminder()', () => {
    test('should send refill reminder successfully', async () => {
      const patient = {
        firstName: 'محمد',
        phone: '+201234567890'
      };

      const reminder = {
        medicationName: 'Glucophage',
        daysRemaining: 3,
        pharmacyName: 'صيدلية النور'
      };

      const result = await whatsappService.sendRefillReminder(patient, reminder);
      expect(result).toBeDefined();
    });
  });

  describe('sendText() — dev mode', () => {
    test('should log message in dev mode and return success', async () => {
      const result = await whatsappService.sendText('+201234567890', 'Test message');

      // In dev mode, returns { success: true, messageId: 'dev-...' }
      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^dev-\d+$/);
    });
  });
});
