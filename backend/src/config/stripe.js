const Stripe = require('stripe');
const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PUBLISHABLE_KEY } = require('./env');
const { logger } = require('../shared/utils/logger');

let stripeClient = null;

try {
  stripeClient = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    appInfo: {
      name: 'MediMind Healthcare Platform',
      version: '1.0.0',
    },
  });
  logger.info('Stripe client initialized successfully.');
} catch (err) {
  logger.warn('Failed to initialize Stripe client with provided key:', err.message);
}

module.exports = {
  stripe: stripeClient,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  STRIPE_PUBLISHABLE_KEY,
};
