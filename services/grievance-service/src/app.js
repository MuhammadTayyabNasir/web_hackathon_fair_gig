require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = express();
const PORT = Number(process.env.PORT || 3003);

const defaultTags = [
  { name: 'urgent', color: '#dc2626' },
  { name: 'commission-issue', color: '#d97706' },
  { name: 'deactivation', color: '#7c3aed' },
  { name: 'payment-delay', color: '#2563eb' },
  { name: 'verified', color: '#16a34a' },
  { name: 'needs-review', color: '#64748b' },
  { name: 'escalated', color: '#b45309' },
  { name: 'resolved', color: '#059669' },
];

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('combined'));

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

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json(fail('FORBIDDEN', 'Insufficient permissions'));
    }
    return next();
  };
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

async function ensureBootstrapData() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS grievance_upvotes (
       grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
       created_at TIMESTAMP DEFAULT NOW(),
       PRIMARY KEY (grievance_id, user_id)
     )`
  );

  for (const tag of defaultTags) {
    await pool.query(
      `INSERT INTO grievance_tags (name, color_hex)
       VALUES ($1, $2)
       ON CONFLICT (name) DO NOTHING`,
      [tag.name, tag.color]
    );
  }
}

/** Strip worker_id from grievance row if anonymous. */
function sanitize(g) {
  if (g && g.is_anonymous) {
    const { worker_id, ...safe } = g;
    return safe;
  }
  return g;
}

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'grievance-service' }));

// POST /api/v1/grievances
app.post('/api/v1/grievances', authenticateToken, requireRole(['worker']),
  body('category').isIn(['commission_change', 'deactivation', 'payment_delay', 'unfair_rating', 'account_issue', 'other']).withMessage('Invalid category'),
  body('description').isLength({ min: 10, max: 2000 }).withMessage('Description must be 10–2000 chars'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(fail('VALIDATION_ERROR', errors.array()[0].msg));
    const { category, description, platform_id, is_anonymous = false } = req.body;
    // Fetch worker city/zone
    const { rows: [profile] } = await pool.query('SELECT city, zone FROM worker_profiles WHERE user_id = $1', [req.user.sub]);
    const city = profile?.city || null;
    const zone = profile?.zone || null;
    const { rows: [g] } = await pool.query(
      `INSERT INTO grievances (worker_id, platform_id, is_anonymous, category, description, city, zone)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.sub, platform_id || null, Boolean(is_anonymous), category, description, city, zone]
    );
    return res.status(201).json(success({ grievance: sanitize(g) }, 'Complaint posted'));
  })
);

// GET /api/v1/grievances
app.get('/api/v1/grievances', authenticateToken,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const where = [];
    const params = [req.user.sub];

    if (req.query.status) {
      params.push(req.query.status);
      where.push(`g.status = $${params.length}`);
    }
    if (req.query.city) {
      params.push(req.query.city);
      where.push(`g.city = $${params.length}`);
    }
    if (req.query.category) {
      params.push(req.query.category);
      where.push(`g.category = $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    params.push(limit);
    const limitPlaceholder = `$${params.length}`;
    params.push(offset);
    const offsetPlaceholder = `$${params.length}`;

    const { rows } = await pool.query(
      `SELECT g.id, g.is_anonymous,
              CASE WHEN g.is_anonymous THEN NULL ELSE g.worker_id END AS worker_id,
              CASE WHEN g.is_anonymous THEN 'Anonymous' ELSE u.name END AS worker_name,
              CASE WHEN g.is_anonymous THEN NULL ELSE u.email END AS worker_email,
              g.platform_id, g.category, g.description, g.status,
              g.city, g.zone, g.upvote_count, g.advocate_note,
              g.escalated_at, g.resolved_at, g.created_at, g.updated_at,
              (guv.user_id IS NOT NULL) AS has_upvoted,
              p.name AS platform_name,
              ARRAY_AGG(DISTINCT gt.name) FILTER (WHERE gt.name IS NOT NULL) AS tags
       FROM grievances g
       LEFT JOIN users u ON u.id = g.worker_id
       LEFT JOIN platforms p ON p.id = g.platform_id
       LEFT JOIN grievance_upvotes guv ON guv.grievance_id = g.id AND guv.user_id = $1
       LEFT JOIN grievance_tag_map gtm ON gtm.grievance_id = g.id
       LEFT JOIN grievance_tags gt ON gt.id = gtm.tag_id
       ${whereSql}
       GROUP BY g.id, u.name, u.email, p.name, guv.user_id
       ORDER BY g.created_at DESC
       LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
      params
    );

    const countWhere = [];
    const countParams = [];
    if (req.query.status) {
      countParams.push(req.query.status);
      countWhere.push(`status = $${countParams.length}`);
    }
    if (req.query.city) {
      countParams.push(req.query.city);
      countWhere.push(`city = $${countParams.length}`);
    }
    if (req.query.category) {
      countParams.push(req.query.category);
      countWhere.push(`category = $${countParams.length}`);
    }
    const countWhereSql = countWhere.length ? `WHERE ${countWhere.join(' AND ')}` : '';
    const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM grievances ${countWhereSql}`, countParams);

    return res.json({
      ...success({ grievances: rows }),
      pagination: { page, limit, total: parseInt(count), totalPages: Math.ceil(parseInt(count) / limit) },
    });
  })
);

// GET /api/v1/grievances/tags
app.get('/api/v1/grievances/tags', authenticateToken,
  asyncHandler(async (req, res) => {
    await ensureBootstrapData();
    const { rows } = await pool.query('SELECT * FROM grievance_tags ORDER BY name');
    return res.json(success({ tags: rows }));
  })
);

// GET /api/v1/grievances/clusters
app.get('/api/v1/grievances/clusters', authenticateToken,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT cc.*, p.name AS platform_name, u.name AS created_by_name
       FROM complaint_clusters cc
       LEFT JOIN platforms p ON p.id = cc.platform_id
       LEFT JOIN users u ON u.id = cc.created_by
       ORDER BY cc.complaint_count DESC`
    );
    return res.json(success({ clusters: rows }));
  })
);

// GET /api/v1/grievances/:id
app.get('/api/v1/grievances/:id', authenticateToken,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT g.*, p.name AS platform_name,
              CASE WHEN g.is_anonymous THEN 'Anonymous' ELSE u.name END AS worker_name,
              CASE WHEN g.is_anonymous THEN NULL ELSE u.email END AS worker_email,
              EXISTS(
                SELECT 1 FROM grievance_upvotes gu
                WHERE gu.grievance_id = g.id AND gu.user_id = $2
              ) AS has_upvoted,
              ARRAY_AGG(DISTINCT gt.name) FILTER (WHERE gt.name IS NOT NULL) AS tags
       FROM grievances g
       LEFT JOIN users u ON u.id = g.worker_id
       LEFT JOIN platforms p ON p.id = g.platform_id
       LEFT JOIN grievance_tag_map gtm ON gtm.grievance_id = g.id
       LEFT JOIN grievance_tags gt ON gt.id = gtm.tag_id
       WHERE g.id = $1 GROUP BY g.id, p.name, u.name, u.email`,
      [req.params.id, req.user.sub]
    );
    if (!rows.length) return res.status(404).json(fail('NOT_FOUND', 'Grievance not found'));
    return res.json(success({ grievance: sanitize(rows[0]) }));
  })
);

// PUT /api/v1/grievances/:id/tag
app.put('/api/v1/grievances/:id/tag', authenticateToken, requireRole(['advocate', 'verifier']),
  body('tag_id').isUUID().withMessage('tag_id must be UUID'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(fail('VALIDATION_ERROR', errors.array()[0].msg));
    const { tag_id } = req.body;
    await pool.query(
      `INSERT INTO grievance_tag_map (grievance_id, tag_id, tagged_by) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
      [req.params.id, tag_id, req.user.sub]
    );
    await pool.query(`UPDATE grievances SET status='tagged', updated_at=NOW() WHERE id=$1 AND status='open'`, [req.params.id]);
    return res.json(success(null, 'Tag added'));
  })
);

// PUT /api/v1/grievances/:id/upvote
app.put('/api/v1/grievances/:id/upvote', authenticateToken,
  asyncHandler(async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const grievanceExists = await client.query('SELECT id FROM grievances WHERE id = $1', [req.params.id]);
      if (!grievanceExists.rows.length) {
        await client.query('ROLLBACK');
        return res.status(404).json(fail('NOT_FOUND', 'Grievance not found'));
      }

      const upvoteInsert = await client.query(
        `INSERT INTO grievance_upvotes (grievance_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (grievance_id, user_id) DO NOTHING
         RETURNING grievance_id`,
        [req.params.id, req.user.sub]
      );

      if (!upvoteInsert.rows.length) {
        const { rows } = await client.query('SELECT upvote_count FROM grievances WHERE id = $1', [req.params.id]);
        await client.query('COMMIT');
        return res.json(success({ upvote_count: rows[0].upvote_count, already_upvoted: true }, 'Already upvoted'));
      }

      const { rows } = await client.query(
        `UPDATE grievances SET upvote_count = upvote_count + 1, updated_at = NOW() WHERE id = $1 RETURNING upvote_count`,
        [req.params.id]
      );
      await client.query('COMMIT');
      return res.json(success({ upvote_count: rows[0].upvote_count, already_upvoted: false }, 'Upvoted'));
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  })
);

// PUT /api/v1/grievances/:id/escalate
app.put('/api/v1/grievances/:id/escalate', authenticateToken, requireRole(['advocate']),
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `UPDATE grievances SET status='escalated', escalated_at=NOW(), advocate_note=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [req.body.note || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json(fail('NOT_FOUND', 'Grievance not found'));
    return res.json(success({ grievance: sanitize(rows[0]) }, 'Escalated'));
  })
);

// PUT /api/v1/grievances/:id/resolve
app.put('/api/v1/grievances/:id/resolve', authenticateToken, requireRole(['advocate']),
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `UPDATE grievances SET status='resolved', resolved_at=NOW(), advocate_note=COALESCE($1,advocate_note), updated_at=NOW() WHERE id=$2 RETURNING *`,
      [req.body.note || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json(fail('NOT_FOUND', 'Grievance not found'));
    return res.json(success({ grievance: sanitize(rows[0]) }, 'Resolved'));
  })
);

// POST /api/v1/grievances/cluster
app.post('/api/v1/grievances/cluster', authenticateToken, requireRole(['advocate']),
  body('name').isLength({ min: 3, max: 100 }).withMessage('Cluster name required'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(fail('VALIDATION_ERROR', errors.array()[0].msg));
    const { name, description, platform_id, category } = req.body;
    const { rows: [cluster] } = await pool.query(
      `INSERT INTO complaint_clusters (name, description, platform_id, category, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, description || null, platform_id || null, category || null, req.user.sub]
    );
    return res.status(201).json(success({ cluster }, 'Cluster created'));
  })
);

// POST /api/v1/grievances/:id/assign-cluster
app.post('/api/v1/grievances/:id/assign-cluster', authenticateToken, requireRole(['advocate']),
  body('cluster_id').isUUID().withMessage('cluster_id must be UUID'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(fail('VALIDATION_ERROR', errors.array()[0].msg));
    const { cluster_id, similarity_score } = req.body;
    await pool.query(
      `INSERT INTO cluster_mapping (grievance_id, cluster_id, similarity_score) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
      [req.params.id, cluster_id, similarity_score || null]
    );
    await pool.query(`UPDATE complaint_clusters SET complaint_count = complaint_count + 1, updated_at=NOW() WHERE id=$1`, [cluster_id]);
    return res.json(success(null, 'Assigned to cluster'));
  })
);

app.use((err, _req, res, _next) => {
  logger.error('Unhandled error', { err: err.message });
  res.status(500).json(fail('SERVER_ERROR', 'Internal server error'));
});

ensureBootstrapData()
  .then(() => {
    app.listen(PORT, () => logger.info(`grievance-service on ${PORT}`));
  })
  .catch((err) => {
    logger.error('Failed to bootstrap grievance service', { err: err.message });
    process.exit(1);
  });
