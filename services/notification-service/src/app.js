require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});

const app = express();
const PORT = Number(process.env.PORT || 3005);

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('combined'));

function authenticateToken(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'Token required' });
  try {
    req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me');
    return next();
  } catch {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'Invalid token' });
  }
}

function success(data, message = 'OK') {
  return { success: true, data, message, timestamp: new Date().toISOString() };
}

// In-memory notification store for demo (replace with FCM in production)
const notifications = new Map();

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'notification-service' }));

// POST /api/v1/notifications/send — internal use
app.post('/api/v1/notifications/send', authenticateToken,
  (req, res) => {
    const { user_id, title, body, data } = req.body;
    if (!user_id || !title || !body) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'user_id, title, body required' });
    }
    const note = { id: Date.now().toString(), user_id, title, body, data: data || {}, sent_at: new Date().toISOString(), is_read: false };
    if (!notifications.has(user_id)) notifications.set(user_id, []);
    notifications.get(user_id).unshift(note);
    logger.info('Notification queued', { user_id, title });
    return res.json(success({ notification: note }, 'Notification queued'));
  }
);

// GET /api/v1/notifications — my notifications
app.get('/api/v1/notifications', authenticateToken,
  (req, res) => {
    const userNotes = notifications.get(req.user.sub) || [];
    return res.json(success({ notifications: userNotes.slice(0, 50), unread: userNotes.filter(n => !n.is_read).length }));
  }
);

// PUT /api/v1/notifications/:id/read
app.put('/api/v1/notifications/:id/read', authenticateToken,
  (req, res) => {
    const userNotes = notifications.get(req.user.sub) || [];
    const note = userNotes.find(n => n.id === req.params.id);
    if (note) note.is_read = true;
    return res.json(success(null, 'Marked as read'));
  }
);

app.listen(PORT, () => logger.info(`notification-service on ${PORT}`));
