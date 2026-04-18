const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticateToken } = require('../middleware/auth.middleware');
const auth = require('../controllers/auth.controller');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RATE_LIMITED',
    message: 'Too many login attempts. Please wait a few minutes and try again.',
    timestamp: new Date().toISOString(),
  },
});

const firebaseLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  // Successful exchanges should not consume the limiter budget.
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: 'RATE_LIMITED',
    message: 'Too many Firebase login attempts. Please wait a few minutes and try again.',
    timestamp: new Date().toISOString(),
  },
});

const firebaseLoginRateLimitMiddleware = process.env.NODE_ENV === 'production'
  ? firebaseLoginLimiter
  : (_req, _res, next) => next();

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password min 8 characters'),
    body('role').isIn(['worker', 'verifier', 'advocate']).withMessage('Role required'),
  ],
  asyncHandler(auth.register)
);

router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  asyncHandler(auth.login)
);

router.post(
  '/firebase-login',
  firebaseLoginRateLimitMiddleware,
  [
    body('idToken').isString().isLength({ min: 10 }).withMessage('idToken is required'),
    body('role').optional().isIn(['worker', 'verifier', 'advocate']).withMessage('Invalid role'),
  ],
  asyncHandler(auth.firebaseLogin)
);

router.post('/refresh', asyncHandler(auth.refresh));
router.get('/me', authenticateToken, asyncHandler(auth.me));
router.post('/logout', asyncHandler(auth.logout));
router.post('/forgot-password', asyncHandler(auth.forgotPassword));
router.post('/verify-email', asyncHandler(auth.verifyEmail));

module.exports = { authRouter: router };
