/**
 * Monitoring Service — وفاء (Wafa)
 *
 * Prometheus metrics collection for backend monitoring.
 *
 * Metrics exposed at /metrics endpoint (Prometheus format).
 *
 * Metrics:
 *  - http_requests_total: Counter (labels: method, route, status)
 *  - http_request_duration_seconds: Histogram (labels: method, route, status)
 *  - active_connections: Gauge
 *  - db_operations_total: Counter (labels: operation, collection)
 *  - socket_connections: Gauge
 *  - doses_confirmed_total: Counter (labels: via)
 *  - notifications_sent_total: Counter (labels: type, channel)
 *  - worker_jobs_processed_total: Counter (labels: job_name, status)
 *
 * Setup:
 *  1. Run Prometheus + Grafana (see monitoring/docker-compose.yml)
 *  2. Configure Prometheus to scrape /metrics
 *  3. Import Grafana dashboards (see monitoring/grafana/dashboards/)
 */

let promClient = null;
let metrics = null;
let initialized = false;

/**
 * Initialize monitoring (creates all metrics)
 */
function initMonitoring() {
  if (initialized) return metrics;

  try {
    promClient = require('prom-client');

    // Create a Registry
    const registry = new promClient.Registry();

    // Default metrics (CPU, memory, event loop)
    promClient.collectDefaultMetrics({
      register: registry,
      prefix: 'wafa_',
      gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
    });

    // ===== HTTP metrics =====
    const httpRequestTotal = new promClient.Counter({
      name: 'wafa_http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [registry]
    });

    const httpRequestDuration = new promClient.Histogram({
      name: 'wafa_http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10],
      registers: [registry]
    });

    const activeConnections = new promClient.Gauge({
      name: 'wafa_active_connections',
      help: 'Currently active connections',
      registers: [registry]
    });

    // ===== Database metrics =====
    const dbOperationsTotal = new promClient.Counter({
      name: 'wafa_db_operations_total',
      help: 'Total database operations',
      labelNames: ['operation', 'collection', 'status'],
      registers: [registry]
    });

    // ===== Business metrics =====
    const dosesConfirmedTotal = new promClient.Counter({
      name: 'wafa_doses_confirmed_total',
      help: 'Total doses confirmed by patients',
      labelNames: ['via'],
      registers: [registry]
    });

    const dosesMissedTotal = new promClient.Counter({
      name: 'wafa_doses_missed_total',
      help: 'Total doses marked as missed',
      registers: [registry]
    });

    const notificationsSentTotal = new promClient.Counter({
      name: 'wafa_notifications_sent_total',
      help: 'Total notifications sent',
      labelNames: ['type', 'channel', 'status'],
      registers: [registry]
    });

    const escalationsTotal = new promClient.Counter({
      name: 'wafa_escalations_total',
      help: 'Total escalations triggered',
      labelNames: ['step'],
      registers: [registry]
    });

    const socketConnections = new promClient.Gauge({
      name: 'wafa_socket_connections',
      help: 'Currently connected Socket.IO clients',
      registers: [registry]
    });

    const workerJobsProcessed = new promClient.Counter({
      name: 'wafa_worker_jobs_processed_total',
      help: 'Total worker jobs processed',
      labelNames: ['job_name', 'status'],
      registers: [registry]
    });

    const workerJobDuration = new promClient.Histogram({
      name: 'wafa_worker_job_duration_seconds',
      help: 'Worker job duration in seconds',
      labelNames: ['job_name'],
      buckets: [0.01, 0.1, 0.5, 1, 5, 10, 30, 60, 120],
      registers: [registry]
    });

    metrics = {
      registry,
      httpRequestTotal,
      httpRequestDuration,
      activeConnections,
      dbOperationsTotal,
      dosesConfirmedTotal,
      dosesMissedTotal,
      notificationsSentTotal,
      escalationsTotal,
      socketConnections,
      workerJobsProcessed,
      workerJobDuration
    };

    initialized = true;
    console.log('✅ Monitoring initialized — Prometheus metrics active');
    return metrics;
  } catch (err) {
    console.warn('⚠️  Monitoring: prom-client not installed:', err.message);
    console.warn('   Install with: npm install prom-client');
    return null;
  }
}

/**
 * Express middleware to track HTTP requests
 */
function requestMiddleware() {
  initMonitoring();

  if (!metrics) {
    return (req, res, next) => next();
  }

  return (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      const route = normalizeRoute(req.route?.path || req.path);
      const method = req.method;
      const status = res.statusCode;

      metrics.httpRequestTotal.inc({ method, route, status: String(status) });
      metrics.httpRequestDuration.observe({ method, route, status: String(status) }, duration);
    });

    next();
  };
}

/**
 * Metrics endpoint handler (Prometheus format)
 */
function metricsHandler() {
  initMonitoring();

  if (!metrics) {
    return (req, res) => {
      res.status(503).send('# Monitoring not initialized (prom-client not installed)\n');
    };
  }

  return async (req, res) => {
    res.set('Content-Type', metrics.registry.contentType);
    res.end(await metrics.registry.metrics());
  };
}

/**
 * Normalize route path (remove IDs, params)
 * /api/v1/medications/65a1b2c3... → /api/v1/medications/:id
 */
function normalizeRoute(path) {
  if (!path) return 'unknown';
  return path
    .replace(/[0-9a-f]{24}/gi, ':id')  // MongoDB ObjectIds
    .replace(/\d+/g, ':id')             // Numeric IDs
    .replace(/\/$/, '');                // Trailing slash
}

// ===== Business metric helpers =====

/**
 * Record a dose confirmation
 * @param {String} via - 'PWA', 'WHATSAPP', 'NOTIFICATION_ACTION', 'CAREGIVER'
 */
function recordDoseConfirmed(via = 'PWA') {
  if (!metrics) return;
  metrics.dosesConfirmedTotal.inc({ via });
}

/**
 * Record a missed dose
 */
function recordDoseMissed() {
  if (!metrics) return;
  metrics.dosesMissedTotal.inc();
}

/**
 * Record a sent notification
 * @param {String} type - Notification type
 * @param {String} channel - 'PUSH', 'SMS', 'WHATSAPP', 'EMAIL'
 * @param {String} status - 'SENT', 'FAILED'
 */
function recordNotificationSent(type, channel, status = 'SENT') {
  if (!metrics) return;
  metrics.notificationsSentTotal.inc({ type, channel, status });
}

/**
 * Record an escalation step
 * @param {String} step - 'PUSH', 'SMS', 'CAREGIVER'
 */
function recordEscalation(step) {
  if (!metrics) return;
  metrics.escalationsTotal.inc({ step });
}

/**
 * Update Socket.IO connections gauge
 * @param {Number} count - Current connected count
 */
function setSocketConnections(count) {
  if (!metrics) return;
  metrics.socketConnections.set(count);
}

/**
 * Record a worker job completion
 * @param {String} jobName - e.g., 'escalation', 'generateDoses'
 * @param {String} status - 'success', 'failed'
 * @param {Number} durationSeconds - Job duration
 */
function recordWorkerJob(jobName, status, durationSeconds) {
  if (!metrics) return;
  metrics.workerJobsProcessed.inc({ job_name: jobName, status });
  if (durationSeconds) {
    metrics.workerJobDuration.observe({ job_name: jobName }, durationSeconds);
  }
}

module.exports = {
  initMonitoring,
  requestMiddleware,
  metricsHandler,
  // Business metrics
  recordDoseConfirmed,
  recordDoseMissed,
  recordNotificationSent,
  recordEscalation,
  setSocketConnections,
  recordWorkerJob
};
