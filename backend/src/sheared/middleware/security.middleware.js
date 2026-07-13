/**
 * Security Middleware — وفاء (Wafa)
 *
 * Centralized security configuration:
 *  - Helmet (HTTP security headers)
 *  - CSP (Content Security Policy)
 *  - Rate limiting (global, auth, media)
 *  - CORS (configurable origins)
 *  - HSTS (forced HTTPS)
 *
 * Based on OWASP Top 10 best practices.
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { logger } = require('../utils/logger');
const { NODE_ENV, FRONTEND_URL, RATE_LIMIT_GLOBAL_MAX, RATE_LIMIT_GLOBAL_WINDOW_MS,
        RATE_LIMIT_AUTH_MAX, RATE_LIMIT_AUTH_WINDOW_MS,
        RATE_LIMIT_MEDIA_MAX, RATE_LIMIT_MEDIA_WINDOW_MS } = require('../../config/env');

// ===== Allowed origins =====
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'https://wafa.vercel.app',
  'https://wafa-app.vercel.app'
].filter(Boolean);

// ===== Helmet configuration =====
const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",  // Required for Next.js dev
        "'unsafe-eval'",    // Required for Next.js dev
        'https://fonts.googleapis.com',
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",  // Required for Tailwind/Next.js
        'https://fonts.googleapis.com',
      ],
      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com',
        'data:',
      ],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https:',
      ],
      connectSrc: [
        "'self'",
        'https://fonts.googleapis.com',
        'https://api.openai.com',
        // Allow WebSocket connections for Socket.IO
        'ws:',
        'wss:',
      ],
      mediaSrc: ["'self'", 'data:', 'blob:'],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'", 'blob:'],
    },
    reportOnly: NODE_ENV !== 'production', // Report-only in dev, enforce in prod
  },

  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Disabled for third-party fonts/images

  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: { policy: 'same-origin' },

  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: 'cross-origin' },

  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },

  // Frameguard (X-Frame-Options)
  frameguard: { action: 'deny' },

  // Hide Powered-By header
  hidePoweredBy: true,

  // HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },

  // IE No Open
  ieNoOpen: true,

  // No Sniff (X-Content-Type-Options)
  noSniff: true,

  // Origin Agent Cluster
  originAgentCluster: true,

  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },

  // X-XSS-Protection (deprecated but still useful for older browsers)
  xssFilter: true
});

// ===== CORS configuration =====
const corsConfig = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400, // 24 hours (preflight cache)
  optionsSuccessStatus: 204
});

// ===== Rate limiters =====

// Global rate limiter (all endpoints)
const rateLimiterGlobal = rateLimit({
  windowMs: RATE_LIMIT_GLOBAL_WINDOW_MS || 60000, // 1 minute
  max: RATE_LIMIT_GLOBAL_MAX || 100, // 100 requests per minute
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'too many requests, please try again later'
    }
  },
  handler: (req, res, next, options) => {
    logger.warn(`Global rate limit exceeded: ${req.ip} on ${req.method} ${req.url}`);
    res.status(429).json(options.message);
  },
  // Skip rate limiting for health check and metrics
  skip: (req) => {
    return req.url === '/api/v1/health' || req.url === '/metrics';
  }
});

// Auth endpoints rate limiter (login, OTP)
const rateLimiterAuth = rateLimit({
  windowMs: RATE_LIMIT_AUTH_WINDOW_MS || 900000, // 15 minutes
  max: RATE_LIMIT_AUTH_MAX || 5, // 5 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'too many authentication attempts, please try again in 15 minutes'
    }
  },
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded: ${req.ip} on ${req.url}`);
    res.status(429).json(options.message);
  }
});

// Media upload rate limiter
const rateLimiterMedia = rateLimit({
  windowMs: RATE_LIMIT_MEDIA_WINDOW_MS || 3600000, // 1 hour
  max: RATE_LIMIT_MEDIA_MAX || 20, // 20 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'MEDIA_RATE_LIMIT_EXCEEDED',
      message: 'too many file uploads, please try again later'
    }
  },
  handler: (req, res, next, options) => {
    logger.warn(`Media rate limit exceeded: ${req.ip}`);
    res.status(429).json(options.message);
  }
});

// Strict rate limiter for OTP sending (1 per minute)
const rateLimiterOtp = rateLimit({
  windowMs: 60000, // 1 minute
  max: 1, // 1 OTP request per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'OTP_RATE_LIMIT',
      message: 'please wait 60 seconds before requesting a new OTP'
    }
  }
});

// Export middleware
module.exports = {
  helmet: helmetConfig,
  cors: corsConfig,
  rateLimiterGlobal,
  rateLimiterAuth,
  rateLimiterMedia,
  rateLimiterOtp,
  // Allowed origins for reference
  allowedOrigins
};
