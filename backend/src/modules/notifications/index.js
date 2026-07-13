const notificationRoutes = require('./routes/notification.route');

module.exports = {
  routes: notificationRoutes,
  // Export services for use by other modules / worker
  services: {
    pushService: require('./services/push.service'),
    notificationService: require('./services/notification.service'),
    escalationService: require('./services/escalation.service')
  }
};
