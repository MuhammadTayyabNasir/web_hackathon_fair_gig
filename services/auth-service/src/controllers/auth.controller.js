const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { ensureFirebaseAdmin } = require('../config/firebase-admin');
const { getAdminDataConnect } = require('../config/dataconnect');
const { workerDashboardSummary } = require('../dataconnect-admin-generated');
const { success, fail } = require('../utils/apiResponse');
const { logger } = require('../utils/logger');

const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(fail('VALIDATION_ERROR', errors.array()[0].msg));
  }
  const { name, email, password, role } = req.body;
  const allowedRoles = ['worker', 'verifier', 'advocate'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json(fail('VALIDATION_ERROR', 'Invalid role'));
  }
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email.toLowerCase(), passwordHash, role]
    );
    return res.status(201).json(success({ user: result.rows[0] }, 'Registered'));
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json(fail('DUPLICATE_EMAIL', 'Email already registered'));
    }
    logger.error('register failed', { err: err.message });
    return res.status(500).json(fail('SERVER_ERROR', 'Could not register'));
  }
}

/**
 * @param {object} userRow
 * @returns {{ accessToken: string, refreshToken: string }}
 */
function issueTokens(userRow) {
  const payload = {
    sub: userRow.id,
    email: userRow.email,
    role: userRow.role,
  };
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
  const refreshToken = jwt.sign({ sub: userRow.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });
  return { accessToken, refreshToken };
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(fail('VALIDATION_ERROR', errors.array()[0].msg));
  }
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      `SELECT id, name, email, password_hash, role, is_active
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );
    if (result.rowCount === 0) {
      return res.status(401).json(fail('INVALID_CREDENTIALS', 'Invalid email or password'));
    }
    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(403).json(fail('ACCOUNT_DISABLED', 'Account disabled'));
    }
    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) {
      return res.status(401).json(fail('INVALID_CREDENTIALS', 'Invalid email or password'));
    }
    const tokens = issueTokens(user);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
    return res.json(
      success({
        accessToken: tokens.accessToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      }, 'Logged in')
    );
  } catch (err) {
    logger.error('login failed', { err: err.message });
    return res.status(500).json(fail('SERVER_ERROR', 'Could not log in'));
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function refresh(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json(fail('UNAUTHORIZED', 'Refresh token missing'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const result = await pool.query(
      `SELECT id, name, email, role FROM users WHERE id = $1 AND is_active = true`,
      [decoded.sub]
    );
    if (result.rowCount === 0) {
      return res.status(401).json(fail('UNAUTHORIZED', 'User not found'));
    }
    const tokens = issueTokens(result.rows[0]);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json(success({ accessToken: tokens.accessToken }, 'Token refreshed'));
  } catch {
    return res.status(401).json(fail('UNAUTHORIZED', 'Invalid refresh token'));
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function me(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, created_at, last_login_at FROM users WHERE id = $1`,
      [req.user.sub]
    );
    if (result.rowCount === 0) {
      return res.status(404).json(fail('NOT_FOUND', 'User not found'));
    }
    return res.json(success({ user: result.rows[0] }));
  } catch (err) {
    logger.error('me failed', { err: err.message });
    return res.status(500).json(fail('SERVER_ERROR', 'Could not load profile'));
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function logout(req, res) {
  res.clearCookie('refreshToken');
  return res.json(success(null, 'Logged out'));
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function forgotPassword(req, res) {
  return res.status(501).json(fail('NOT_IMPLEMENTED', 'Forgot password not wired yet'));
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function verifyEmail(req, res) {
  return res.status(501).json(fail('NOT_IMPLEMENTED', 'Email verification uses Firebase flow'));
}

/**
 * Exchanges a Firebase ID token for FairGig API tokens.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function firebaseLogin(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(fail('VALIDATION_ERROR', errors.array()[0].msg));
  }

  const { idToken, role } = req.body;
  const allowedRoles = ['worker', 'verifier', 'advocate'];
  if (role && !allowedRoles.includes(role)) {
    return res.status(400).json(fail('VALIDATION_ERROR', 'Invalid role'));
  }

  try {
    const admin = ensureFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = (decoded.email || `${decoded.uid}@firebase.local`).toLowerCase();
    const name = decoded.name || 'FairGig User';
    const emailVerified = Boolean(decoded.email_verified);

    const existingUserResult = await pool.query(
      `SELECT id, name, email, role
       FROM users
       WHERE email = $1 OR firebase_uid = $2
       LIMIT 1`,
      [email, decoded.uid]
    );

    let userResult;
    if (existingUserResult.rowCount > 0) {
      const existingUser = existingUserResult.rows[0];
      userResult = await pool.query(
        `UPDATE users
         SET
           firebase_uid = $1,
           name = CASE WHEN NULLIF($2, '') IS NOT NULL THEN $2 ELSE name END,
           email_verified_at = CASE WHEN $3 THEN NOW() ELSE email_verified_at END,
           updated_at = NOW()
         WHERE id = $4
         RETURNING id, name, email, role`,
        [decoded.uid, name.trim(), emailVerified, existingUser.id]
      );
    } else {
      userResult = await pool.query(
        `INSERT INTO users (firebase_uid, name, email, role, email_verified_at)
         VALUES ($1, $2, $3, $4, CASE WHEN $5 THEN NOW() ELSE NULL END)
         RETURNING id, name, email, role`,
        [decoded.uid, name, email, role || 'worker', emailVerified]
      );
    }

    const user = userResult.rows[0];
    const tokens = issueTokens(user);
    let dashboardSeed = null;

    try {
      const dc = getAdminDataConnect();
      const seedResponse = await workerDashboardSummary(dc, { workerId: user.id });
      dashboardSeed = seedResponse.data;
    } catch (seedError) {
      // Keep login flow resilient if Data Connect is unavailable.
      logger.warn('dashboard seed fetch failed', { err: seedError.message, userId: user.id });
    }

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json(
      success(
        {
          accessToken: tokens.accessToken,
          user,
          firebaseUid: decoded.uid,
          dashboardSeed,
        },
        'Firebase login successful'
      )
    );
  } catch (error) {
    logger.error('firebase login failed', { err: error.message });
    return res.status(401).json(fail('UNAUTHORIZED', 'Invalid Firebase token'));
  }
}

module.exports = {
  register,
  login,
  refresh,
  me,
  logout,
  forgotPassword,
  verifyEmail,
  firebaseLogin,
};
