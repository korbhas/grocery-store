const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/wishlistController');

router.use(requireAuth);

router.get('/', ctrl.getWishlist);
router.post('/:productId', ctrl.addToWishlist);
router.delete('/:productId', ctrl.removeFromWishlist);

module.exports = router;
