const db = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRES_IN = '7d';

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
const user = await db('users').where({ id: payload.id }).first();
  if (!user) return res.status(401).json({ error: 'User not found' });
  if (user.is_banned) return res.status(403).json({ error: 'Account has been suspended' });
  req.userId = user.id;
  req.dbUser = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

async function attachUser(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await db('users').where({ id: payload.id }).first();
    if (user) req.dbUser = user;
  } catch {
    // invalid token, just continue without user
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(req.dbUser.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { hashPassword, comparePassword, generateToken, requireAuth, attachUser, requireRole };