const aiRoutes = require('./routes/ai.route');

module.exports = {
  routes: aiRoutes,
  services: {
    drugInteractionService: require('./services/drugInteraction.service'),
    adherencePredictionService: require('./services/adherencePrediction.service')
  }
};
