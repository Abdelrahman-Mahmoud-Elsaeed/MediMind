const Payment = require('../models/Payment.model');
const AppError = require('../../../shared/utils/AppError');

class PaymentService {
  async initiatePayment(payerAccountId, payload) {
    const payment = new Payment({
      payerAccountId,
      payerRole: payload.payerRole,
      amount: payload.amount,
      currency: payload.currency || "EGP",
      paymentMethod: payload.paymentMethod,
      paymentType: payload.paymentType,
      referenceId: payload.referenceId,
      referenceModel: payload.referenceModel,
      gatewayTransactionId: payload.gatewayTransactionId || null,
      status: 'PENDING'
    });

    await payment.save();
    return payment;
  }

  async completePayment(paymentId, gatewayResponse = {}) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new AppError('Payment record not found', 404, 'PAYMENT_NOT_FOUND');
    }

    payment.status = 'COMPLETED';
    payment.gatewayRawResponse = gatewayResponse;
    if (gatewayResponse.transactionId) {
      payment.gatewayTransactionId = gatewayResponse.transactionId;
    }

    // Link RefillOrder if payment type matches
    if (payment.paymentType === 'REFILL_ORDER_PAYMENT' && payment.referenceModel === 'RefillOrder') {
      const RefillOrder = require('../../medications/models/RefillOrder.model');
      await RefillOrder.findByIdAndUpdate(payment.referenceId, { paymentId: payment._id });
    }

    await payment.save();
    return payment;
  }

  async listPayments(payerAccountId, userRole) {
    const filter = {};
    if (userRole !== 'ADMIN') {
      filter.payerAccountId = payerAccountId;
    }

    return await Payment.find(filter)
      .sort({ createdAt: -1 });
  }
}

module.exports = new PaymentService();
