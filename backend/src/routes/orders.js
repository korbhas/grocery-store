const router = require('express').Router();
const { requireAuth, syncUser, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/orderController');

router.use(requireAuth(), syncUser, requireRole('customer'));

router.post('/', ctrl.createOrder);
router.post('/verify-payment', ctrl.verifyPayment);
router.get('/', ctrl.getOrders);
router.get('/:id', ctrl.getOrder);

module.exports = router;
