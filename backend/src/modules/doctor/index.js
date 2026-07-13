const doctorRoutes = require('./routes/doctor.route');

module.exports = {
  routes: doctorRoutes,
  services: {
    doctorService: require('./services/doctor.service')
  }
};
