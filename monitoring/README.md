# 📊 وفاء (Wafa) — Monitoring Setup

This directory contains Prometheus + Grafana configuration for monitoring the Wafa platform.

## 🚀 Quick Start

```bash
# Start monitoring stack
cd monitoring
docker-compose up -d

# Access:
# Prometheus: http://localhost:9090
# Grafana:    http://localhost:3001 (admin / wafa_admin)
```

## 📋 What's Monitored

### Backend API Metrics
- HTTP requests (count, duration, status codes)
- Active connections
- Memory usage (heap, external)
- Event loop lag
- GC duration

### Business Metrics
- Doses confirmed (by channel: PWA, WhatsApp, notification action)
- Doses missed
- Notifications sent (by type + channel)
- Escalations triggered (by step: PUSH, SMS, CAREGIVER)
- Socket.IO connections
- Worker jobs processed (by name + status)

### System Metrics
- CPU usage
- Memory usage
- Disk I/O
- Network I/O

## 📊 Dashboards

### API Overview (`api-overview.json`)
- HTTP Requests per Second
- Error Rate (%)
- Active Socket.IO Connections
- Uptime
- HTTP Request Duration (p95) — timeseries
- Requests by Status Code — timeseries
- Memory Usage — timeseries

### Business Metrics (`business-metrics.json`)
- Doses Confirmed (per minute)
- Doses Missed (per minute)
- Notifications Sent (by channel) — timeseries
- Escalations (by step) — timeseries
- Worker Jobs Processed — timeseries

## 🔧 Configuration

### Prometheus
- Scrape interval: 15s
- Targets: `api:8080` (backend), `worker:3001` (worker)
- Config: `prometheus/prometheus.yml`

### Grafana
- Auto-provisioned datasources (Prometheus)
- Auto-provisioned dashboards (2 dashboards)
- Anonymous read access (viewer role)
- Admin: `admin` / `wafa_admin`

## 📈 Adding Custom Metrics

### Backend (Node.js)
```javascript
const monitoring = require('./src/sheared/services/monitoring.service');

// Record business events
monitoring.recordDoseConfirmed('PWA');
monitoring.recordNotificationSent('DOSE_REMINDER', 'PUSH', 'SENT');
monitoring.recordEscalation('PUSH');

// Update gauges
monitoring.setSocketConnections(42);
```

### Worker
```javascript
const monitoring = require('./src/sheared/services/monitoring.service');

// After job completes
monitoring.recordWorkerJob('escalation', 'success', 1.5);
```

## 🚨 Alerts (Optional)

Add alert rules in Prometheus:

```yaml
# prometheus/alerts.yml
groups:
  - name: wafa-alerts
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(wafa_http_requests_total{status=~"5.."}[5m]))
          / sum(rate(wafa_http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate (>5%)"
      
      - alert: WorkerDown
        expr: up{job="wafa-worker"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Worker is down"
```

## 🔌 Integration with Main App

The monitoring stack connects to the main Wafa services:
- Backend exposes `/metrics` endpoint (Prometheus format)
- Worker exposes `/metrics` endpoint
- Both must be running for metrics to appear

### Local Development
```bash
# Terminal 1: Backend (exposes /metrics)
cd backend && npm run dev

# Terminal 2: Worker
cd worker && npm start

# Terminal 3: Monitoring
cd monitoring && docker-compose up -d
```

### Production
Add the monitoring stack to your deployment:
- Railway: Deploy Prometheus + Grafana as services
- Or use managed services (Grafana Cloud, Datadog)
