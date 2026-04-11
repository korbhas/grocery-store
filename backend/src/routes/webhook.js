const router = require('express').Router();
const crypto = require('crypto');
const db = require('../db/db');

router.post('/razorpay', async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const razorpayOrderId = payload.payment.entity.order_id;
      const razorpayPaymentId = payload.payment.entity.id;

      const order = await db('orders').where({ razorpay_order_id: razorpayOrderId }).first();
      if (order) {
        await db('orders').where({ id: order.id }).update({ status: 'processing' });
        await db('payments').where({ order_id: order.id }).update({
          razorpay_payment_id: razorpayPaymentId,
          status: 'captured',
          paid_at: db.fn.now(),
        });
      }
    }

    if (event === 'payment.failed') {
      const razorpayOrderId = payload.payment.entity.order_id;
      const order = await db('orders').where({ razorpay_order_id: razorpayOrderId }).first();
      if (order) {
        await db('orders').where({ id: order.id }).update({ status: 'cancelled' });
        await db('payments').where({ order_id: order.id }).update({ status: 'failed' });
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
