const router = require('express').Router();
const db = require('../db/db');
const { requireAuth } = require('../middleware/auth');
const { hashPassword, comparePassword } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../utils/helpers');

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await db('users').where({ id: req.userId }).first();
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role });
}));

router.put('/profile', requireAuth, asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !name.trim()) throw new AppError('Name is required', 400);
  if (!email || !email.trim()) throw new AppError('Email is required', 400);

  const existing = await db('users').where({ email: email.trim() }).whereNot({ id: req.userId }).first();
  if (existing) throw new AppError('Email already in use', 400);

  const [user] = await db('users')
    .where({ id: req.userId })
    .update({ name: name.trim(), email: email.trim(), phone: phone?.trim() || null, updated_at: db.fn.now() })
    .returning(['id', 'name', 'email', 'phone', 'role']);

  res.json(user);
}));

router.put('/password', requireAuth, asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password) throw new AppError('Current password is required', 400);
  if (!new_password || new_password.length < 6) throw new AppError('New password must be at least 6 characters', 400);

  const user = await db('users').where({ id: req.userId }).first();
  const valid = await comparePassword(current_password, user.password_hash);
  if (!valid) throw new AppError('Current password is incorrect', 400);

  const hash = await hashPassword(new_password);
  await db('users').where({ id: req.userId }).update({ password_hash: hash, updated_at: db.fn.now() });

  res.json({ message: 'Password updated' });
}));

router.delete('/account', requireAuth, asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) throw new AppError('Password is required to delete account', 400);

  const user = await db('users').where({ id: req.userId }).first();
  const valid = await comparePassword(password, user.password_hash);
  if (!valid) throw new AppError('Incorrect password', 400);

  await db('users').where({ id: req.userId }).update({ is_banned: true, updated_at: db.fn.now() });

  res.json({ message: 'Account deactivated' });
}));

module.exports = router;
