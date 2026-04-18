const jwt = require('jsonwebtoken');
const { fail } = require('../utils/apiResponse');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authenticateToken(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json(fail('UNAUTHORIZED', 'Access token required'));
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json(fail('UNAUTHORIZED', 'Invalid or expired access token'));
  }
}

/**
 * @param {string[]} roles
 * @returns {import('express').RequestHandler}
 */
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json(fail('FORBIDDEN', 'Insufficient permissions'));
    }
    return next();
  };
}

module.exports = { authenticateToken, requireRole };
