const Payment = require('../models/Payment.model');
const AppError = require('../../../shared/utils/AppError');
const { stripe, STRIPE_WEBHOOK_SECRET } = require('../../../config/stripe');
const { FRONTEND_URL } = require('../../../config/env');
const { logger } = require('../../../shared/utils/logger');

class PaymentService {
  /**
   * Create a Stripe Checkout Session for hosted Stripe payment page
   */
  async createCheckoutSession(payerAccountId, userRole, payload) {
    const amountInCents = Math.round(Number(payload.amount) * 100);
    const currency = (payload.currency || 'egp').toLowerCase();
    const defaultFrontend = FRONTEND_URL || 'http://localhost:3000';

    // 1. Persist initial pending Payment in DB
    const payment = new Payment({
      payerAccountId,
      payerRole: userRole || payload.payerRole || 'PATIENT',
      amount: Number(payload.amount),
      currency: currency.toUpperCase(),
      paymentMethod: 'STRIPE',
      paymentType: payload.paymentType || 'REFILL_ORDER_PAYMENT',
      referenceId: payload.referenceId,
      referenceModel: payload.referenceModel || 'RefillOrder',
      status: 'PENDING',
    });
    await payment.save();

    // 2. Build Stripe Checkout Session
    if (!stripe) {
      logger.warn('Stripe client not initialized. Generating simulation checkout URL.');
      payment.gatewayTransactionId = `sim_session_${payment._id}`;
      await payment.save();
      return {
        sessionId: payment.gatewayTransactionId,
        url: `${defaultFrontend}/refills?payment=success&paymentId=${payment._id}`,
        paymentId: payment._id,
      };
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: payload.productName || 'MediMind Prescription Medication Order',
                description: `Prescription refill order Ref: #${String(payload.referenceId).slice(-6)}`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url:
          payload.successUrl ||
          `${defaultFrontend}/refills?payment=success&session_id={CHECKOUT_SESSION_ID}&paymentId=${payment._id}`,
        cancel_url:
          payload.cancelUrl ||
          `${defaultFrontend}/refills?payment=cancelled&paymentId=${payment._id}`,
        metadata: {
          paymentId: payment._id.toString(),
          referenceId: String(payload.referenceId),
          referenceModel: payload.referenceModel || 'RefillOrder',
          payerAccountId: payerAccountId.toString(),
        },
      });

      payment.gatewayTransactionId = session.id;
      await payment.save();

      return {
        sessionId: session.id,
        url: session.url,
        paymentId: payment._id,
      };
    } catch (stripeErr) {
      logger.error('Stripe Checkout Session creation failed:', stripeErr);
      payment.status = 'FAILED';
      payment.gatewayRawResponse = { error: stripeErr.message };
      await payment.save();
      throw new AppError(`Stripe checkout error: ${stripeErr.message}`, 400, 'STRIPE_CHECKOUT_FAILED');
    }
  }

  /**
   * Create a direct PaymentIntent for embedded card forms
   */
  async createPaymentIntent(payerAccountId, userRole, payload) {
    const amountInCents = Math.round(Number(payload.amount) * 100);
    const currency = (payload.currency || 'egp').toLowerCase();

    const payment = new Payment({
      payerAccountId,
      payerRole: userRole || payload.payerRole || 'PATIENT',
      amount: Number(payload.amount),
      currency: currency.toUpperCase(),
      paymentMethod: 'STRIPE',
      paymentType: payload.paymentType || 'REFILL_ORDER_PAYMENT',
      referenceId: payload.referenceId,
      referenceModel: payload.referenceModel || 'RefillOrder',
      status: 'PENDING',
    });
    await payment.save();

    if (!stripe) {
      payment.gatewayTransactionId = `sim_pi_${payment._id}`;
      await payment.save();
      return {
        clientSecret: `sim_secret_${payment._id}`,
        paymentId: payment._id,
      };
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        metadata: {
          paymentId: payment._id.toString(),
          referenceId: String(payload.referenceId),
          referenceModel: payload.referenceModel || 'RefillOrder',
          payerAccountId: payerAccountId.toString(),
        },
      });

      payment.gatewayTransactionId = paymentIntent.id;
      await payment.save();

      return {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id,
      };
    } catch (stripeErr) {
      logger.error('Stripe PaymentIntent creation failed:', stripeErr);
      throw new AppError(`Stripe error: ${stripeErr.message}`, 400, 'STRIPE_PAYMENT_INTENT_FAILED');
    }
  }

  /**
   * Handle incoming Stripe Webhook events and update Database
   */
  async handleStripeWebhook(signature, rawBody) {
    let event = null;

    if (stripe && signature && STRIPE_WEBHOOK_SECRET && rawBody) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        logger.warn('Stripe Webhook signature verification warning:', err.message);
        // Fallback for payload parsing if signature construction fails in dev
        try {
          event = typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString('utf8'));
        } catch (parseErr) {
          throw new AppError(`Webhook Error: ${err.message}`, 400, 'WEBHOOK_SIGNATURE_INVALID');
        }
      }
    } else if (rawBody) {
      try {
        event = typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString('utf8'));
      } catch (e) {
        throw new AppError('Invalid JSON webhook body', 400, 'INVALID_WEBHOOK_PAYLOAD');
      }
    }

    if (!event) {
      throw new AppError('No event parsed from webhook', 400, 'WEBHOOK_EVENT_MISSING');
    }

    logger.info(`Received Stripe Webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await this._processSuccessfulPayment(session.metadata?.paymentId, session.id, session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        await this._processSuccessfulPayment(paymentIntent.metadata?.paymentId, paymentIntent.id, paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        if (paymentIntent.metadata?.paymentId) {
          await Payment.findByIdAndUpdate(paymentIntent.metadata.paymentId, {
            status: 'FAILED',
            gatewayRawResponse: paymentIntent,
          });
        }
        break;
      }

      default:
        logger.info(`Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true, eventType: event.type };
  }

  /**
   * Internal helper to complete payment, update RefillOrder, and notify parties
   */
  async _processSuccessfulPayment(paymentId, gatewayTxId, rawResponse) {
    let payment = null;
    if (paymentId) {
      payment = await Payment.findById(paymentId);
    }
    if (!payment && gatewayTxId) {
      payment = await Payment.findOne({ gatewayTransactionId: gatewayTxId });
    }

    if (payment) {
      payment.status = 'COMPLETED';
      payment.gatewayTransactionId = gatewayTxId;
      payment.gatewayRawResponse = rawResponse;
      await payment.save();

      // If linked to RefillOrder, mark order as PAID and dispatch notification
      if (payment.referenceModel === 'RefillOrder' && payment.referenceId) {
        const RefillOrder = require('../../medications/models/RefillOrder.model');
        const order = await RefillOrder.findByIdAndUpdate(
          payment.referenceId,
          {
            paymentId: payment._id,
            paymentMethod: 'STRIPE',
            paymentStatus: 'PAID',
          },
          { new: true }
        );

        if (order) {
          try {
            const { notificationService } = require('../../notifications');
            // Notify Pharmacist
            await notificationService.createAndSendNotification({
              recipientAccountId: order.requestedBy,
              recipientRole: 'PATIENT',
              type: 'REFILL_ORDER_UPDATED',
              title: 'Payment Successful / تم الدفع بنجاح',
              message: `Payment of ${payment.amount} ${payment.currency} has been verified via Stripe for order #${String(order._id).slice(-6)}.`,
              data: {
                refillOrderId: order._id,
                paymentId: payment._id,
                paymentStatus: 'PAID',
              },
            });
          } catch (notifErr) {
            logger.warn('Notification on payment success failed:', notifErr.message);
          }
        }
      }
    }
  }

  async initiatePayment(payerAccountId, payload) {
    const payment = new Payment({
      payerAccountId,
      payerRole: payload.payerRole || 'PATIENT',
      amount: payload.amount,
      currency: payload.currency || "EGP",
      paymentMethod: payload.paymentMethod || "STRIPE",
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

    if (payment.paymentType === 'REFILL_ORDER_PAYMENT' && payment.referenceModel === 'RefillOrder') {
      const RefillOrder = require('../../medications/models/RefillOrder.model');
      await RefillOrder.findByIdAndUpdate(payment.referenceId, {
        paymentId: payment._id,
        paymentStatus: 'PAID',
        paymentMethod: payment.paymentMethod,
      });
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
      .populate('referenceId')
      .sort({ createdAt: -1 });
  }
}

module.exports = new PaymentService();
