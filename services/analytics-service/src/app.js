require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { createClient } = require('redis');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = express();
const PORT = Number(process.env.PORT || 3004);

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('combined'));

// Redis client (graceful fallback if unavailable)
let redisClient = null;
(async () => {
  try {
    redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    redisClient.on('error', () => { redisClient = null; });
    await redisClient.connect();
    logger.info('Redis connected');
  } catch {
    logger.warn('Redis unavailable — caching disabled');
    redisClient = null;
  }
})();

async function cacheGet(key) {
  if (!redisClient) return null;
  try { return await redisClient.get(key); } catch { return null; }
}
async function cacheSet(key, value, ttlSeconds) {
  if (!redisClient) return;
  try { await redisClient.setEx(key, ttlSeconds, value); } catch { /* ignore */ }
}

function authenticateToken(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json(fail('UNAUTHORIZED', 'Access token required'));
  try {
    req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me');
    return next();
  } catch {
    return res.status(401).json(fail('UNAUTHORIZED', 'Invalid or expired token'));
  }
}

function success(data, message = 'OK') {
  return { success: true, data, message, timestamp: new Date().toISOString() };
}
function fail(error, message) {
  return { success: false, error, message, timestamp: new Date().toISOString() };
}
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'analytics-service' }));

// GET /api/v1/analytics/worker — personal, never cached
app.get('/api/v1/analytics/worker', authenticateToken,
  asyncHandler(async (req, res) => {
    const { sub: workerId } = req.user;
    const months = parseInt(req.query.months) || 6;
    const { rows: monthly } = await pool.query(
      `SELECT
         TO_CHAR(s.work_date, 'YYYY-MM') AS month,
         COUNT(*) AS shifts,
         SUM(s.net_received) AS net,
         SUM(s.gross_earned) AS gross,
         AVG(s.commission_rate_pct) AS avg_commission,
         AVG(s.net_received / NULLIF(s.hours_worked, 0)) AS avg_hourly
       FROM shifts s
       WHERE s.worker_id = $1 AND s.work_date >= NOW() - MAKE_INTERVAL(months => $2)
       GROUP BY month ORDER BY month`,
      [workerId, months]
    );
    const { rows: [totals] } = await pool.query(
      `SELECT COUNT(*) AS total_shifts,
              COALESCE(SUM(net_received), 0) AS total_net,
              COALESCE(AVG(commission_rate_pct), 0) AS avg_commission,
              COALESCE(AVG(net_received / NULLIF(hours_worked, 0)), 0) AS avg_hourly
       FROM shifts WHERE worker_id = $1`,
      [workerId]
    );
    const { rows: platform_breakdown } = await pool.query(
      `SELECT p.name AS platform, COUNT(*) AS shifts, SUM(s.net_received) AS net, AVG(s.commission_rate_pct) AS avg_commission
       FROM shifts s JOIN platforms p ON p.id = s.platform_id
       WHERE s.worker_id = $1
       GROUP BY p.name ORDER BY net DESC`,
      [workerId]
    );
    return res.json(success({ monthly, totals, platform_breakdown }));
  })
);

// GET /api/v1/analytics/city-median — cached 1hr
app.get('/api/v1/analytics/city-median', authenticateToken,
  asyncHandler(async (req, res) => {
    const city = req.query.city || 'Lahore';
    const category = req.query.category || 'ride_hailing';
    const cacheKey = `city_median:${city}:${category}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const { rows } = await pool.query(
      `SELECT p.name AS platform,
              AVG(cs.reported_rate_pct) AS median_rate,
              MAX(cs.snapshot_date) AS latest_snapshot
       FROM commission_snapshots cs
       JOIN platforms p ON p.id = cs.platform_id
       WHERE cs.city = $1 AND cs.category = $2
         AND cs.snapshot_date >= NOW() - INTERVAL '3 months'
       GROUP BY p.name ORDER BY median_rate DESC`,
      [city, category]
    );
    const result = success({ city, category, medians: rows });
    await cacheSet(cacheKey, JSON.stringify(result), 3600);
    return res.json(result);
  })
);

// GET /api/v1/analytics/commission-trends — cached 30min
app.get('/api/v1/analytics/commission-trends', authenticateToken,
  asyncHandler(async (req, res) => {
    const city = req.query.city || 'Lahore';
    const cacheKey = `commission_trends:${city}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const { rows } = await pool.query(
      `SELECT p.name AS platform,
              TO_CHAR(cs.snapshot_date, 'YYYY-MM') AS month,
              AVG(cs.reported_rate_pct) AS avg_rate
       FROM commission_snapshots cs
       JOIN platforms p ON p.id = cs.platform_id
       WHERE cs.city = $1 AND cs.snapshot_date >= NOW() - INTERVAL '6 months'
       GROUP BY p.name, month ORDER BY p.name, month`,
      [city]
    );
    const result = success({ city, trends: rows });
    await cacheSet(cacheKey, JSON.stringify(result), 1800);
    return res.json(result);
  })
);

// GET /api/v1/analytics/vulnerability — workers with 20%+ income drop, cached 15min
app.get('/api/v1/analytics/vulnerability', authenticateToken,
  asyncHandler(async (req, res) => {
    const cacheKey = 'vulnerability_flags';
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const curr = new Date();
    const currYM = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`;
    const prev = new Date(curr.getFullYear(), curr.getMonth() - 1, 1);
    const prevYM = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;

    const { rows } = await pool.query(
      `WITH monthly AS (
         SELECT s.worker_id,
                SUM(CASE WHEN TO_CHAR(s.work_date,'YYYY-MM') = $1 THEN s.net_received ELSE 0 END) AS curr_net,
                SUM(CASE WHEN TO_CHAR(s.work_date,'YYYY-MM') = $2 THEN s.net_received ELSE 0 END) AS prev_net
         FROM shifts s
         WHERE s.work_date >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
         GROUP BY s.worker_id
       )
       SELECT u.name, wp.city, wp.zone, wp.category,
              m.curr_net, m.prev_net,
              ROUND(((m.prev_net - m.curr_net) / NULLIF(m.prev_net, 0) * 100)::numeric, 1) AS drop_pct
       FROM monthly m
       JOIN users u ON u.id = m.worker_id
       LEFT JOIN worker_profiles wp ON wp.user_id = m.worker_id
       WHERE m.prev_net > 0 AND (m.prev_net - m.curr_net) / m.prev_net > 0.2
       ORDER BY drop_pct DESC`,
      [currYM, prevYM]
    );
    const result = success({ flagged: rows, checked_at: new Date().toISOString() });
    await cacheSet(cacheKey, JSON.stringify(result), 900);
    return res.json(result);
  })
);

// GET /api/v1/analytics/top-complaints — cached 15min
app.get('/api/v1/analytics/top-complaints', authenticateToken,
  asyncHandler(async (req, res) => {
    const cacheKey = 'top_complaints';
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const { rows } = await pool.query(
      `SELECT g.category, g.city, COUNT(*) AS count, SUM(g.upvote_count) AS total_upvotes
       FROM grievances g
       WHERE g.created_at >= NOW() - INTERVAL '3 months'
       GROUP BY g.category, g.city
       ORDER BY count DESC LIMIT 20`
    );
    const result = success({ top_complaints: rows });
    await cacheSet(cacheKey, JSON.stringify(result), 900);
    return res.json(result);
  })
);

// GET /api/v1/analytics/income-distribution — cached 30min
app.get('/api/v1/analytics/income-distribution', authenticateToken,
  asyncHandler(async (req, res) => {
    const cacheKey = 'income_distribution';
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const { rows } = await pool.query(
      `SELECT wp.city, wp.zone, wp.category,
              COUNT(DISTINCT s.worker_id) AS worker_count,
              AVG(s.net_received) AS avg_net_per_shift,
              PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY s.net_received) AS median_net,
              AVG(s.commission_rate_pct) AS avg_commission
       FROM shifts s
       JOIN worker_profiles wp ON wp.user_id = s.worker_id
       WHERE s.work_date >= NOW() - INTERVAL '3 months'
       GROUP BY wp.city, wp.zone, wp.category
       ORDER BY wp.city, wp.zone`
    );
    const result = success({ distribution: rows });
    await cacheSet(cacheKey, JSON.stringify(result), 1800);
    return res.json(result);
  })
);

// GET /api/v1/analytics/platform-comparison — cached 30min
app.get('/api/v1/analytics/platform-comparison', authenticateToken,
  asyncHandler(async (req, res) => {
    const city = req.query.city || null;
    const cacheKey = `platform_comparison:${city || 'all'}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const cityClause = city ? 'AND wp.city = $1' : '';
    const params = city ? [city] : [];
    const { rows } = await pool.query(
      `SELECT p.name AS platform,
              COUNT(DISTINCT s.worker_id) AS workers,
              COUNT(s.id) AS total_shifts,
              AVG(s.net_received) AS avg_net,
              AVG(s.commission_rate_pct) AS avg_commission,
              AVG(s.net_received / NULLIF(s.hours_worked, 0)) AS avg_hourly,
              PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY s.commission_rate_pct) AS median_commission
       FROM shifts s
       JOIN platforms p ON p.id = s.platform_id
       JOIN worker_profiles wp ON wp.user_id = s.worker_id
       WHERE s.work_date >= NOW() - INTERVAL '3 months' ${cityClause}
       GROUP BY p.name ORDER BY avg_commission ASC`,
      params
    );
    const result = success({ city: city || 'all', comparison: rows });
    await cacheSet(cacheKey, JSON.stringify(result), 1800);
    return res.json(result);
  })
);

app.use((err, _req, res, _next) => {
  logger.error('Unhandled error', { err: err.message });
  res.status(500).json(fail('SERVER_ERROR', 'Internal server error'));
});

app.listen(PORT, () => logger.info(`analytics-service on ${PORT}`));
