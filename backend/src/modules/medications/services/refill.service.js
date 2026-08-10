const RefillOrder = require('../models/RefillOrder.model');
const Medication = require('../models/Medication.model');
const Patient = require('../../auth/models/Patient.model');
const Pharmacist = require('../../auth/models/Pharmacist.model');
const relationshipsService = require('../../relationships/services/relationships.service');
const AppError = require('../../../shared/utils/AppError');

class RefillService {
  async validateAccess(userAccountId, userRole, patientId, requiredPermission) {
    if (userRole === 'PATIENT') {
      const patient = await Patient.findOne({ accountId: userAccountId });
      if (!patient || patient._id.toString() !== patientId.toString()) {
        throw new AppError('Access denied to this patient profile', 403, 'FORBIDDEN');
      }
      return patient;
    } else if (userRole === 'FAMILY_CAREGIVER' || userRole === 'PROFESSIONAL_CAREGIVER' || userRole === 'DOCTOR' || userRole === 'CAREGIVER') {
      const hasPermission = await relationshipsService.checkCaregiverAccess(
        patientId,
        userAccountId,
        requiredPermission
      );
      if (!hasPermission) {
        throw new AppError('Insufficient permissions to access this patient profile', 403, 'FORBIDDEN');
      }
      return null;
    } else {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }
  }

  async createRefillOrder(userAccountId, userRole, payload) {
    let patientId;
    if (userRole === 'PATIENT') {
      const patient = await Patient.findOne({ accountId: userAccountId });
      if (!patient) {
        throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND');
      }
      patientId = patient._id;
    } else {
      // Caregiver or Doctor
      if (!payload.patientId) {
        throw new AppError('patientId is required', 400, 'VALIDATION_ERROR');
      }
      patientId = payload.patientId;
      await this.validateAccess(userAccountId, userRole, patientId, 'canOrderRefills');
    }

    const medication = await Medication.findOne({ _id: payload.medicationId, patientId });
    if (!medication) {
      throw new AppError('Medication not found for this patient', 404, 'MEDICATION_NOT_FOUND');
    }

    const pharmacist = await Pharmacist.findById(payload.targetPharmacyId);
    if (!pharmacist) {
      throw new AppError('Target pharmacy not found', 404, 'PHARMACY_NOT_FOUND');
    }

    const order = new RefillOrder({
      patientId,
      medicationId: payload.medicationId,
      requestedBy: userAccountId,
      targetPharmacyId: payload.targetPharmacyId,
      fulfillmentType: payload.fulfillmentType,
      deliveryAddress: payload.deliveryAddress,
      quantityRequested: payload.quantityRequested,
      orderStatus: 'SUBMITTED'
    });

    await order.save();
    return order;
  }

  async updateRefillOrderStatus(userAccountId, userRole, orderId, payload) {
    const order = await RefillOrder.findById(orderId);
    if (!order) {
      throw new AppError('Refill order not found', 404, 'ORDER_NOT_FOUND');
    }

    if (userRole === 'PHARMACIST') {
      const pharmacist = await Pharmacist.findOne({ accountId: userAccountId });
      if (!pharmacist || order.targetPharmacyId.toString() !== pharmacist._id.toString()) {
        throw new AppError('Access denied. Order is assigned to another pharmacy', 403, 'FORBIDDEN');
      }
    } else if (userRole !== 'ADMIN') {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    order.orderStatus = payload.orderStatus;
    if (payload.pharmacistNotes) {
      order.pharmacistNotes = payload.pharmacistNotes;
    }

    if (payload.orderStatus === 'DISPENSED') {
      order.dispensedAt = new Date();
    }

    if (payload.orderStatus === 'COMPLETED') {
      // Replenish patient inventory stock when order completes
      const medication = await Medication.findById(order.medicationId);
      if (medication) {
        medication.inventory.currentQuantity += order.quantityRequested;
        await medication.save();
      }
    }

    await order.save();
    return order;
  }

  async listRefillOrders(userAccountId, userRole, query = {}) {
    const filter = {};

    if (userRole === 'PATIENT') {
      const patient = await Patient.findOne({ accountId: userAccountId });
      if (!patient) {
        throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND');
      }
      filter.patientId = patient._id;
    } else if (userRole === 'PHARMACIST') {
      const pharmacist = await Pharmacist.findOne({ accountId: userAccountId });
      if (!pharmacist) {
        throw new AppError('Pharmacist profile not found', 404, 'PHARMACIST_NOT_FOUND');
      }
      filter.targetPharmacyId = pharmacist._id;
    } else if (userRole === 'FAMILY_CAREGIVER' || userRole === 'PROFESSIONAL_CAREGIVER' || userRole === 'DOCTOR' || userRole === 'CAREGIVER') {
      // Caregiver views patient refills
      if (!query.patientId) {
        throw new AppError('patientId filter is required for caregivers', 400, 'VALIDATION_ERROR');
      }
      await this.validateAccess(userAccountId, userRole, query.patientId, 'canOrderRefills');
      filter.patientId = query.patientId;
    } else if (userRole !== 'ADMIN') {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    if (query.status) {
      filter.orderStatus = query.status;
    }

    return await RefillOrder.find(filter)
      .populate('medicationId', 'name formType')
      .populate('patientId', 'firstName lastName')
      .sort({ createdAt: -1 });
  }
}

module.exports = new RefillService();
