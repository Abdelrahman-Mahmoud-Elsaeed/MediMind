const { initSocket, getIO, emitToUser, emitToPharmacy, emitToRole } = require('../../config/socket');
const notificationService = require('../../modules/notifications/services/notification.service');
const Notification = require('../../modules/notifications/models/Notification.model');
const http = require('http');
const app = require('../../app');

describe('Notifications & Socket.IO Unit and Integration Tests', () => {
  let server;
  let io;

  beforeAll((done) => {
    server = http.createServer(app);
    io = initSocket(server);
    server.listen(0, done);
  });

  afterAll((done) => {
    if (io) io.close();
    server.close(done);
  });

  it('should initialize Socket.IO server properly', () => {
    expect(getIO()).toBeDefined();
  });

  it('should safely execute emitToUser, emitToPharmacy, and emitToRole without throwing', () => {
    expect(() => {
      emitToUser('account_123', 'test_event', { sample: 1 });
      emitToPharmacy('pharm_123', 'new_refill_order', { orderId: 'rx_99' });
      emitToRole('PHARMACIST', 'broadcast_alert', { text: 'Hello' });
    }).not.toThrow();
  });

  it('should have correct schema and validation defaults on Notification model', () => {
    const notif = new Notification({
      recipientAccountId: '65a000000000000000000001',
      recipientRole: 'PHARMACIST',
      type: 'REFILL_ORDER_CREATED',
      title: 'New Refill Request',
      message: 'Patient requested refill',
      data: { refillOrderId: '65a000000000000000000002' },
    });

    expect(notif.isRead).toBe(false);
    expect(notif.readAt).toBeNull();
    expect(notif.recipientRole).toBe('PHARMACIST');
    expect(notif.type).toBe('REFILL_ORDER_CREATED');
  });

  it('should validate notification service methods exist', () => {
    expect(typeof notificationService.createAndSendNotification).toBe('function');
    expect(typeof notificationService.listUserNotifications).toBe('function');
    expect(typeof notificationService.markAsRead).toBe('function');
    expect(typeof notificationService.markAllAsRead).toBe('function');
    expect(typeof notificationService.getUnreadCount).toBe('function');
    expect(typeof notificationService.deleteNotification).toBe('function');
  });
});
