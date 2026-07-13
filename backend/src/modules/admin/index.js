const adminRoutes = require('./routes/admin.route');

module.exports = {
  routes: adminRoutes,
  services: {
    adminService: require('./services/admin.service')
  }
};
