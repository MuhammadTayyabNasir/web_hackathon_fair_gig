const { Pool } = require('pg');
const { logger } = require('../utils/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

pool.on('error', (err) => {
  logger.error('PostgreSQL pool error', { err: err.message });
});

module.exports = { pool };
