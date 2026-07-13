const pharmacyRoutes = require('./routes/pharmacy.route');

module.exports = {
  routes: pharmacyRoutes,
  services: {
    pharmacyService: require('./services/pharmacy.service')
  }
};
