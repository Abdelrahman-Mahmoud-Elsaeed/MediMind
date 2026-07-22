// src/modules/consent/index.js
const consentRoutes = require('./routes/consent.route');

module.exports = {
  routes: consentRoutes,
  service: require('./services/consent.service'),
};
