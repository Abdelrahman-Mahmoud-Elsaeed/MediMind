const Medication = require('../models/Medication.model');
const Patient = require('../../auth/models/Patient.model');
const Account = require('../../auth/models/Account.model');
const fcmService = require('../../../shared/services/fcm.service');
const AppError = require('../../../shared/utils/AppError');

class OrderService {
  // Patient orders medication refill from pharmacy
  async orderMedication(userAccountId, medicationId, quantity = 1) {
    const med = await Medication.findById(medicationId);
    if (!med) throw new AppError('Medication not found', 404, 'MEDICATION_NOT_FOUND', { en: 'Not found.', ar: 'غير موجود.' });

    const patient = await Patient.findOne({ accountId: userAccountId });
    if (!patient) throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND', { en: 'Not found.', ar: 'غير موجود.' });

    if (med.patientId.toString() !== patient._id.toString()) {
      throw new AppError('Access denied', 403, 'FORBIDDEN', { en: 'Access denied.', ar: 'تم رفض الوصول.' });
    }

    // Create order record (in production, this would be a separate Order collection)
    const order = {
      orderId: `ORD-${Date.now()}`,
      medicationId: med._id,
      medicationName: med.name,
      patientId: patient._id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      quantity,
      status: 'PENDING',
      createdAt: new Date(),
    };

    // In production: notify the linked pharmacy via FCM
    // For now, just return the order
    return order;
  }
}

module.exports = new OrderService();
