const router = require('express').Router();
const db = require('../db/db');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await db('users').where({ id: req.userId }).first();
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role });
}));

module.exports = router;