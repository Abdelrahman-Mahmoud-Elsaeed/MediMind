const routes = require('./routes/notification.route');
const notificationService = require('./services/notification.service');
const Notification = require('./models/Notification.model');

module.exports = {
  routes,
  notificationService,
  Notification,
};
