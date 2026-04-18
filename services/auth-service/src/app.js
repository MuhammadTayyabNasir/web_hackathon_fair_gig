require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { authRouter } = require('./routes/auth.routes');
const { fail } = require('./utils/apiResponse');
const { logger } = require('./utils/logger');

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('combined'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

app.use('/api/v1/auth', authRouter);

app.use((err, _req, res, _next) => {
  logger.error('Unhandled error', { err: err.message, stack: err.stack });
  res.status(500).json(fail('SERVER_ERROR', 'Unexpected error'));
});

app.use((_req, res) => {
  res.status(404).json(fail('NOT_FOUND', 'Route not found'));
});

app.listen(PORT, () => {
  logger.info(`auth-service listening on ${PORT}`);
});
