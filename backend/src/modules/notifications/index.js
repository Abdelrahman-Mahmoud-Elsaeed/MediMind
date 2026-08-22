const routes = require('./routes/notifications.route');
const notificationsService = require('./services/notifications.service');
const notificationService = require('./services/notification.service');
const Notification = require('./models/Notification.model');

module.exports = {
  routes,
  notificationsService,
  notificationService,
  Notification,
};
