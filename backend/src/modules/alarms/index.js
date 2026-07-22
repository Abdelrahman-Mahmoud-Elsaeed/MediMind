const alarmsRoutes = require('./routes/alarms.route');
module.exports = { routes: alarmsRoutes, service: require('./services/alarms.service') };
