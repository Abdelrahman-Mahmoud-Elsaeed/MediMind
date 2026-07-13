const exportRoutes = require('./routes/export.route');

module.exports = {
  routes: exportRoutes,
  services: {
    exportService: require('./services/export.service')
  }
};
