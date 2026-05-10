const router = require('express').Router();
const db = require('../db/db');
const { hashPassword, comparePassword, generateToken, requireAuth, attachUser } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../utils/helpers');

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !name.trim()) throw new AppError('Name is required', 400);
  if (!email || !email.trim()) throw new AppError('Email is required', 400);
  if (!password || password.length < 6) throw new AppError('Password must be at least 6 characters', 400);

  const existing = await db('users').where({ email: email.trim().toLowerCase() }).first();
  if (existing) throw new AppError('Email already registered', 409);

  const passwordHash = await hashPassword(password);

  const [user] = await db('users').insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : null,
    password_hash: passwordHash,
    role: 'customer',
  }).returning('*');

  const token = generateToken(user);

  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    token,
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new AppError('Email and password are required', 400);

  const user = await db('users').where({ email: email.trim().toLowerCase() }).first();
  if (!user || !user.password_hash) throw new AppError('Invalid email or password', 401);

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) throw new AppError('Invalid email or password', 401);

  if (user.is_banned) throw new AppError('Account has been suspended', 403);

  const token = generateToken(user);

  res.json({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, is_banned: user.is_banned },
    token,
  });
}));

router.get('/me', requireAuth, attachUser, asyncHandler(async (req, res) => {
  const user = await db('users').where({ id: req.userId }).first();
  if (!user) throw new AppError('User not found', 404);

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    is_banned: user.is_banned,
  });
}));

module.exports = router;