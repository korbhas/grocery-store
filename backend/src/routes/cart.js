const router = require('express').Router();
const { requireAuth, attachUser, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/cartController');

router.use(requireAuth, attachUser, requireRole('customer'));

router.get('/', ctrl.getCart);
router.post('/', ctrl.addToCart);
router.put('/:id', ctrl.updateCartItem);
router.delete('/:id', ctrl.removeCartItem);
router.delete('/', ctrl.clearCart);

module.exports = router;