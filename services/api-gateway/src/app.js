require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = Number(process.env.PORT || 3000);

const AUTH_URL    = process.env.AUTH_SERVICE_URL    || 'http://localhost:3001';
const EARNINGS_URL = process.env.EARNINGS_SERVICE_URL || 'http://localhost:3002';
const GRIEVANCE_URL = process.env.GRIEVANCE_SERVICE_URL || 'http://localhost:3003';
const ANALYTICS_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3004';
const NOTIFY_URL  = process.env.NOTIFY_SERVICE_URL  || 'http://localhost:3005';
const ANOMALY_URL  = process.env.ANOMALY_SERVICE_URL  || 'http://localhost:8001';
const CERT_URL    = process.env.CERT_SERVICE_URL    || 'http://localhost:8002';

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173'],
  credentials: true,
}));
app.use(morgan('combined'));

/** Attach user from Bearer JWT if valid — does not block. */
function attachUser(req, _res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me');
    } catch { /* invalid token — downstream service will reject */ }
  }
  next();
}

/** Require valid JWT; return 401 otherwise. */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'Access token required', timestamp: new Date().toISOString() });
  }
  return next();
}

app.use(attachUser);

const proxyOpts = (target) => ({
  target,
  changeOrigin: true,
  on: {
    error: (err, _req, res) => {
      res.status(502).json({ success: false, error: 'GATEWAY_ERROR', message: `Upstream unavailable: ${err.message}`, timestamp: new Date().toISOString() });
    },
  },
});

// Health
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() }));

// Auth — public
app.use('/api/v1/auth', createProxyMiddleware(proxyOpts(AUTH_URL)));

// Public certificate view
app.use('/cert', createProxyMiddleware(proxyOpts(CERT_URL)));

// Anomaly — public detect + health; worker history needs auth
app.use('/api/v1/anomaly/health', createProxyMiddleware(proxyOpts(ANOMALY_URL)));
app.use('/api/v1/anomaly/detect', createProxyMiddleware(proxyOpts(ANOMALY_URL)));
app.use('/api/v1/anomaly', requireAuth, createProxyMiddleware(proxyOpts(ANOMALY_URL)));

// Certificate — generate needs auth; public token view already handled above
app.use('/api/v1/certificate', requireAuth, createProxyMiddleware(proxyOpts(CERT_URL)));

// Earnings
app.use('/api/v1/earnings', requireAuth, createProxyMiddleware(proxyOpts(EARNINGS_URL)));

// Grievances
app.use('/api/v1/grievances', requireAuth, createProxyMiddleware(proxyOpts(GRIEVANCE_URL)));

// Analytics
app.use('/api/v1/analytics', requireAuth, createProxyMiddleware(proxyOpts(ANALYTICS_URL)));

// Notifications
app.use('/api/v1/notifications', requireAuth, createProxyMiddleware(proxyOpts(NOTIFY_URL)));

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Route not found', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.info(`api-gateway listening on ${PORT}`);
});
