// src/app.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');

const { NODE_ENV, COOKIE_SECRET } = require('./config/env');
const { morganLogger } = require('./sheared/utils/logger');
const rootRouter = require('./index.route');
const { errorMiddleware, notFoundMiddleware } = require('./sheared/middleware/error.middleware');
const securityMiddleware = require('./sheared/middleware/security.middleware');
const sentryService = require('./sheared/services/sentry.service');
const monitoringService = require('./sheared/services/monitoring.service');

const app = express();
const server = http.createServer(app);

// ===== Initialize Sentry (must be first) =====
sentryService.initSentry();

// ===== Sentry request handler (before all middleware) =====
app.use(sentryService.requestHandler());

// ===== Security middleware (helmet, CSP, rate limiting) =====
app.use(securityMiddleware.helmet);
app.use(securityMiddleware.cors);
app.use(securityMiddleware.rateLimiterGlobal);

// ===== Body parsing =====
app.use(morganLogger);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(COOKIE_SECRET));

// ===== Monitoring (Prometheus metrics) =====
app.use(monitoringService.requestMiddleware());

// ===== CORS =====
app.use(cors({
  origin: NODE_ENV === 'production' ? false : true,
  credentials: true,
}));

// ===== Routes =====
app.use('/api/v1', rootRouter);

// ===== Metrics endpoint =====
app.get('/metrics', monitoringService.metricsHandler());

// ===== 404 handler =====
app.use(notFoundMiddleware);

// ===== Sentry error handler (before regular error handler) =====
app.use(sentryService.errorHandler());

// ===== Regular error handler =====
app.use(errorMiddleware);

module.exports = { app, server };
