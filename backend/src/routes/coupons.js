const router = require('express').Router();
const db = require('../db/db');
const { asyncHandler, AppError } = require('../utils/helpers');

router.post('/validate', asyncHandler(async (req, res) => {
  const { code, order_amount } = req.body;

  if (!code || !code.trim()) throw new AppError('Coupon code is required', 400);
  if (!order_amount || Number(order_amount) <= 0) throw new AppError('Order amount is required', 400);

  const coupon = await db('coupons')
    .where({ code: code.trim().toUpperCase() })
    .first();

  if (!coupon) throw new AppError('Invalid coupon code', 404);
  if (!coupon.is_active) throw new AppError('This coupon is no longer active', 400);

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) throw new AppError('This coupon is not yet active', 400);
  if (coupon.expires_at && new Date(coupon.expires_at) < now) throw new AppError('This coupon has expired', 400);
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) throw new AppError('This coupon has reached its usage limit', 400);
  if (Number(order_amount) < Number(coupon.min_order_amount)) throw new AppError(`Minimum order amount is ₹${coupon.min_order_amount}`, 400);

  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (Number(order_amount) * Number(coupon.discount_value)) / 100;
  } else {
    discount = Number(coupon.discount_value);
  }

  if (discount > Number(order_amount)) discount = Number(order_amount);

  res.json({
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value),
      min_order_amount: Number(coupon.min_order_amount),
    },
    discount_amount: Math.round(discount * 100) / 100,
    final_amount: Math.round((Number(order_amount) - discount) * 100) / 100,
  });
}));

module.exports = router;