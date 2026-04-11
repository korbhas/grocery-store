const router = require('express').Router();
const { requireAuth, syncUser, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

router.use(requireAuth(), syncUser, requireRole('admin'));

// Products
router.get('/products', ctrl.getProducts);
router.post('/products', ctrl.createProduct);
router.put('/products/:id', ctrl.updateProduct);
router.delete('/products/:id', ctrl.deleteProduct);

// Categories
router.post('/categories', ctrl.createCategory);

// Orders
router.get('/orders', ctrl.getOrders);
router.put('/orders/:id/status', ctrl.updateOrderStatus);

module.exports = router;
