require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { body, query: queryVal, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const Papa = require('papaparse');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = express();
const PORT = Number(process.env.PORT || 3002);

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

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

const csvUploadLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3, message: fail('RATE_LIMIT', 'CSV upload limit: 3/hour') });

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'earnings-service' }));

// POST /api/v1/earnings/shifts
app.post('/api/v1/earnings/shifts', authenticateToken, requireRole(['worker']),
  body('platform_id').isUUID().withMessage('platform_id must be UUID'),
  body('work_date').isISO8601().withMessage('work_date required (YYYY-MM-DD)'),
  body('gross_earned').isFloat({ min: 0 }).withMessage('gross_earned must be >= 0'),
  body('platform_deductions').isFloat({ min: 0 }).withMessage('platform_deductions must be >= 0'),
  body('net_received').isFloat({ min: 0 }).withMessage('net_received must be >= 0'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(fail('VALIDATION_ERROR', errors.array()[0].msg));
    const { platform_id, work_date, shift_start, shift_end, hours_worked, gross_earned, platform_deductions, net_received, import_source = 'manual' } = req.body;
    const result = await pool.query(
      `INSERT INTO shifts (worker_id, platform_id, work_date, shift_start, shift_end, hours_worked, gross_earned, platform_deductions, net_received, import_source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id, worker_id, platform_id, work_date, shift_start, shift_end, hours_worked, gross_earned, platform_deductions, net_received, commission_rate_pct, import_source, created_at`,
      [req.user.sub, platform_id, work_date, shift_start || null, shift_end || null, hours_worked || null, gross_earned, platform_deductions, net_received, import_source]
    );
    const shift = result.rows[0];
    // Auto-create pending verification
    await pool.query('INSERT INTO verifications (shift_id, status) VALUES ($1, $2) ON CONFLICT DO NOTHING', [shift.id, 'pending']);
    return res.status(201).json(success({ shift }, 'Shift added'));
  })
);

// GET /api/v1/earnings/shifts
app.get('/api/v1/earnings/shifts', authenticateToken, requireRole(['worker']),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const { rows: shifts } = await pool.query(
      `SELECT s.*, p.name AS platform_name, v.status AS verification_status
       FROM shifts s
       JOIN platforms p ON p.id = s.platform_id
       LEFT JOIN verifications v ON v.shift_id = s.id
       WHERE s.worker_id = $1
       ORDER BY s.work_date DESC
       LIMIT $2 OFFSET $3`,
      [req.user.sub, limit, offset]
    );
    const { rows: [{ count }] } = await pool.query('SELECT COUNT(*) FROM shifts WHERE worker_id = $1', [req.user.sub]);
    const total = parseInt(count);
    return res.json({ ...success({ shifts }), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  })
);

// GET /api/v1/earnings/shifts/:id
app.get('/api/v1/earnings/shifts/:id', authenticateToken,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT s.*, p.name AS platform_name, v.status AS verification_status, v.verifier_note
       FROM shifts s
       JOIN platforms p ON p.id = s.platform_id
       LEFT JOIN verifications v ON v.shift_id = s.id
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json(fail('NOT_FOUND', 'Shift not found'));
    const shift = rows[0];
    if (req.user.role === 'worker' && shift.worker_id !== req.user.sub) {
      return res.status(403).json(fail('FORBIDDEN', 'Not your shift'));
    }
    return res.json(success({ shift }));
  })
);

// PUT /api/v1/earnings/shifts/:id
app.put('/api/v1/earnings/shifts/:id', authenticateToken, requireRole(['worker']),
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query('SELECT worker_id FROM shifts WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json(fail('NOT_FOUND', 'Shift not found'));
    if (rows[0].worker_id !== req.user.sub) return res.status(403).json(fail('FORBIDDEN', 'Not your shift'));
    const { platform_id, work_date, shift_start, shift_end, hours_worked, gross_earned, platform_deductions, net_received } = req.body;
    const { rows: updated } = await pool.query(
      `UPDATE shifts SET platform_id=COALESCE($1,platform_id), work_date=COALESCE($2,work_date),
       shift_start=COALESCE($3,shift_start), shift_end=COALESCE($4,shift_end),
       hours_worked=COALESCE($5,hours_worked), gross_earned=COALESCE($6,gross_earned),
       platform_deductions=COALESCE($7,platform_deductions), net_received=COALESCE($8,net_received),
       updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [platform_id, work_date, shift_start, shift_end, hours_worked, gross_earned, platform_deductions, net_received, req.params.id]
    );
    return res.json(success({ shift: updated[0] }, 'Shift updated'));
  })
);

// DELETE /api/v1/earnings/shifts/:id
app.delete('/api/v1/earnings/shifts/:id', authenticateToken, requireRole(['worker']),
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query('SELECT worker_id FROM shifts WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json(fail('NOT_FOUND', 'Shift not found'));
    if (rows[0].worker_id !== req.user.sub) return res.status(403).json(fail('FORBIDDEN', 'Not your shift'));
    await pool.query('DELETE FROM shifts WHERE id = $1', [req.params.id]);
    return res.json(success(null, 'Shift deleted'));
  })
);

// POST /api/v1/earnings/shifts/csv
app.post('/api/v1/earnings/shifts/csv', authenticateToken, requireRole(['worker']), csvUploadLimiter,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json(fail('NO_FILE', 'CSV file required'));
    const csv = req.file.buffer.toString('utf8');
    const { data, errors: parseErrors } = Papa.parse(csv, { header: true, skipEmptyLines: true, dynamicTyping: true });
    if (parseErrors.length && !data.length) return res.status(400).json(fail('PARSE_ERROR', 'Could not parse CSV'));

    const required = ['date', 'platform', 'hours', 'gross', 'deductions', 'net'];
    const batchId = uuidv4();
    let imported = 0, failed = 0;
    const rowErrors = [];

    await pool.query(
      `INSERT INTO csv_import_batches (id, worker_id, original_filename, total_rows, status) VALUES ($1,$2,$3,$4,'processing')`,
      [batchId, req.user.sub, req.file.originalname || 'upload.csv', data.length]
    );

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const missingCols = required.filter(c => !(c in row) || row[c] === null || row[c] === '');
      if (missingCols.length) {
        rowErrors.push({ row: i + 1, error: `Missing columns: ${missingCols.join(', ')}` });
        failed++; continue;
      }
      try {
        const { rows: [platform] } = await pool.query(
          `SELECT id FROM platforms WHERE LOWER(name) = LOWER($1) OR LOWER(slug) = LOWER($1) LIMIT 1`,
          [String(row.platform)]
        );
        if (!platform) {
          rowErrors.push({ row: i + 1, error: `Unknown platform: ${row.platform}` });
          failed++; continue;
        }
        const shiftResult = await pool.query(
          `INSERT INTO shifts (worker_id, platform_id, work_date, hours_worked, gross_earned, platform_deductions, net_received, import_source, batch_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,'csv',$8) RETURNING id`,
          [req.user.sub, platform.id, row.date, row.hours, row.gross, row.deductions, row.net, batchId]
        );
        await pool.query('INSERT INTO verifications (shift_id, status) VALUES ($1,$2) ON CONFLICT DO NOTHING', [shiftResult.rows[0].id, 'pending']);
        imported++;
      } catch (err) {
        rowErrors.push({ row: i + 1, error: err.message });
        failed++;
      }
    }

    await pool.query(
      `UPDATE csv_import_batches SET imported_rows=$1, failed_rows=$2, status='completed', error_log=$3 WHERE id=$4`,
      [imported, failed, JSON.stringify(rowErrors), batchId]
    );

    return res.json(success({ batch_id: batchId, total: data.length, imported, failed, row_errors: rowErrors }, `Imported ${imported} of ${data.length} rows`));
  })
);

// POST /api/v1/earnings/shifts/:id/screenshot
app.post('/api/v1/earnings/shifts/:id/screenshot', authenticateToken, requireRole(['worker']),
  upload.single('screenshot'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json(fail('NO_FILE', 'Screenshot required'));
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(req.file.mimetype)) return res.status(400).json(fail('INVALID_TYPE', 'Only jpeg/png/webp allowed'));
    const { rows } = await pool.query('SELECT worker_id FROM shifts WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json(fail('NOT_FOUND', 'Shift not found'));
    if (rows[0].worker_id !== req.user.sub) return res.status(403).json(fail('FORBIDDEN', 'Not your shift'));

    // Without Firebase SDK wired, store as placeholder URL
    const storageUrl = `https://storage.example.com/shifts/${req.params.id}/${uuidv4()}.${req.file.mimetype.split('/')[1]}`;

    await pool.query(
      `INSERT INTO screenshot_uploads (shift_id, uploader_id, storage_url, file_size_bytes, mime_type, original_filename)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [req.params.id, req.user.sub, storageUrl, req.file.size, req.file.mimetype, req.file.originalname || 'screenshot']
    );
    await pool.query(
      `INSERT INTO verifications (shift_id, status) VALUES ($1,'pending') ON CONFLICT (shift_id) DO UPDATE SET status='pending'`,
      [req.params.id]
    );
    return res.json(success({ storage_url: storageUrl }, 'Screenshot uploaded'));
  })
);

// GET /api/v1/earnings/pending — verifier queue
app.get('/api/v1/earnings/pending', authenticateToken, requireRole(['verifier', 'advocate']),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT v.id AS verification_id, v.status, v.assigned_at,
              s.id AS shift_id, s.work_date, s.gross_earned, s.platform_deductions, s.net_received, s.hours_worked,
              s.commission_rate_pct, p.name AS platform_name,
              u.name AS worker_name, u.id AS worker_id,
              sc.storage_url AS screenshot_url
       FROM verifications v
       JOIN shifts s ON s.id = v.shift_id
       JOIN platforms p ON p.id = s.platform_id
       JOIN users u ON u.id = s.worker_id
       LEFT JOIN screenshot_uploads sc ON sc.shift_id = s.id
       WHERE v.status = 'pending'
       ORDER BY s.work_date DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM verifications WHERE status = 'pending'`);
    return res.json({ ...success({ queue: rows }), pagination: { page, limit, total: parseInt(count), totalPages: Math.ceil(parseInt(count) / limit) } });
  })
);

// PUT /api/v1/earnings/shifts/:id/verify
app.put('/api/v1/earnings/shifts/:id/verify', authenticateToken, requireRole(['verifier']),
  body('status').isIn(['verified', 'flagged', 'unverifiable']).withMessage('Invalid status'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(fail('VALIDATION_ERROR', errors.array()[0].msg));
    const { status, verifier_note, flagged_reason } = req.body;
    const { rows } = await pool.query(
      `UPDATE verifications SET status=$1, verifier_id=$2, verifier_note=$3, flagged_reason=$4, verified_at=NOW()
       WHERE shift_id=$5 RETURNING *`,
      [status, req.user.sub, verifier_note || null, flagged_reason || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json(fail('NOT_FOUND', 'Verification record not found'));
    return res.json(success({ verification: rows[0] }, `Shift ${status}`));
  })
);

// GET /api/v1/earnings/summary
app.get('/api/v1/earnings/summary', authenticateToken, requireRole(['worker']),
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT
         COUNT(s.id) AS total_shifts,
         COALESCE(SUM(s.net_received), 0) AS total_net,
         COALESCE(SUM(s.gross_earned), 0) AS total_gross,
         COALESCE(SUM(s.platform_deductions), 0) AS total_deductions,
         COALESCE(AVG(s.commission_rate_pct), 0) AS avg_commission_rate,
         COALESCE(AVG(s.net_received / NULLIF(s.hours_worked, 0)), 0) AS avg_hourly_rate,
         MIN(s.work_date) AS first_shift,
         MAX(s.work_date) AS last_shift
       FROM shifts s WHERE s.worker_id = $1`,
      [req.user.sub]
    );
    const summary = rows[0];
    // Monthly breakdown (last 6 months)
    const { rows: monthly } = await pool.query(
      `SELECT TO_CHAR(work_date, 'YYYY-MM') AS month,
              COUNT(*) AS shifts,
              SUM(net_received) AS net,
              SUM(gross_earned) AS gross
       FROM shifts
       WHERE worker_id = $1 AND work_date >= NOW() - INTERVAL '6 months'
       GROUP BY month ORDER BY month DESC`,
      [req.user.sub]
    );
    return res.json(success({ summary, monthly }));
  })
);

// GET /api/v1/earnings/city-median
app.get('/api/v1/earnings/city-median', authenticateToken,
  asyncHandler(async (req, res) => {
    const city = req.query.city || 'Lahore';
    const category = req.query.category || 'ride_hailing';
    const { rows } = await pool.query(
      `SELECT p.name AS platform, AVG(cs.reported_rate_pct) AS median_rate, COUNT(*) AS data_points
       FROM commission_snapshots cs
       JOIN platforms p ON p.id = cs.platform_id
       WHERE cs.city = $1 AND cs.category = $2 AND cs.snapshot_date >= NOW() - INTERVAL '3 months'
       GROUP BY p.name ORDER BY p.name`,
      [city, category]
    );
    return res.json(success({ city, category, medians: rows }));
  })
);

// GET /api/v1/earnings/platforms
app.get('/api/v1/earnings/platforms', authenticateToken,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query('SELECT id, name, slug FROM platforms WHERE is_active = true ORDER BY name');
    return res.json(success({ platforms: rows }));
  })
);

app.use((err, _req, res, _next) => {
  logger.error('Unhandled error', { err: err.message });
  res.status(500).json(fail('SERVER_ERROR', 'Internal server error'));
});

app.listen(PORT, () => logger.info(`earnings-service on ${PORT}`));
