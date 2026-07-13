const relationshipRoutes = require('./routes/relationship.route');

module.exports = {
  routes: relationshipRoutes,
  services: {
    relationshipService: require('./services/relationship.service')
  }
};
