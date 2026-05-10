const router = require('express').Router();
const { requireAuth, attachUser, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/orderController');

router.post('/', attachUser, ctrl.createOrder);
router.post('/verify-payment', ctrl.verifyPayment);
router.get('/:id', ctrl.getOrder);

router.use(requireAuth, attachUser, requireRole('customer'));

router.get('/', ctrl.getOrders);

module.exports = router;