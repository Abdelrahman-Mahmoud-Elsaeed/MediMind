const paymentService = require('../../modules/payments/services/payment.service');
const Payment = require('../../modules/payments/models/Payment.model');
const RefillOrder = require('../../modules/medications/models/RefillOrder.model');
const { notificationService } = require('../../modules/notifications');

describe('Payment & Stripe Gateway Unit and Integration Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize paymentService and verify all core methods exist', () => {
    expect(typeof paymentService.createCheckoutSession).toBe('function');
    expect(typeof paymentService.createPaymentIntent).toBe('function');
    expect(typeof paymentService.handleStripeWebhook).toBe('function');
    expect(typeof paymentService.initiatePayment).toBe('function');
    expect(typeof paymentService.completePayment).toBe('function');
    expect(typeof paymentService.listPayments).toBe('function');
  });

  it('should validate Payment model schema and defaults correctly', () => {
    const payment = new Payment({
      payerAccountId: '65a000000000000000000001',
      payerRole: 'PATIENT',
      amount: 150,
      paymentMethod: 'STRIPE',
      paymentType: 'REFILL_ORDER_PAYMENT',
      referenceId: '65a000000000000000000002',
      referenceModel: 'RefillOrder',
    });

    expect(payment.amount).toBe(150);
    expect(payment.currency).toBe('EGP');
    expect(payment.status).toBe('PENDING');
    expect(payment.paymentMethod).toBe('STRIPE');
    expect(payment.paymentType).toBe('REFILL_ORDER_PAYMENT');
  });

  it('should handle webhook event simulation cleanly without throwing', async () => {
    jest.spyOn(Payment, 'findById').mockResolvedValue({
      _id: '65a000000000000000000003',
      status: 'PENDING',
      referenceModel: 'RefillOrder',
      referenceId: '65a000000000000000000004',
      amount: 150,
      currency: 'EGP',
      save: jest.fn().mockResolvedValue(true),
    });

    jest.spyOn(RefillOrder, 'findByIdAndUpdate').mockResolvedValue({
      _id: '65a000000000000000000004',
      orderStatus: 'SUBMITTED',
      requestedBy: '65a000000000000000000001',
    });

    jest.spyOn(notificationService, 'createAndSendNotification').mockResolvedValue({
      _id: '65a000000000000000000005',
    });

    const mockWebhookEvent = {
      id: 'evt_test_mock_999',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_mock_123',
          metadata: {
            paymentId: '65a000000000000000000003',
            referenceId: '65a000000000000000000004',
            referenceModel: 'RefillOrder',
          },
          amount_total: 15000,
          currency: 'egp',
          payment_status: 'paid',
        },
      },
    };

    const result = await paymentService.handleStripeWebhook(null, JSON.stringify(mockWebhookEvent));
    expect(result).toHaveProperty('received', true);
    expect(result.eventType).toBe('checkout.session.completed');
  });
});
