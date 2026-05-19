const router = require('express').Router();
const { requireAuth, attachUser, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

router.use(requireAuth, attachUser, requireRole('admin'));

router.get('/dashboard', ctrl.getDashboard);
router.get('/dashboard/stats', ctrl.getDashboardPeriod);

router.get('/products', ctrl.getProducts);
router.post('/products', ctrl.createProduct);
router.put('/products/:id', ctrl.updateProduct);
router.delete('/products/:id', ctrl.deleteProduct);

router.get('/products/:id/variants', ctrl.getVariants);
router.post('/products/:id/variants', ctrl.createVariant);
router.put('/products/:id/variants/:variantId', ctrl.updateVariant);
router.delete('/products/:id/variants/:variantId', ctrl.deleteVariant);

router.get('/inventory', ctrl.getInventory);
router.put('/inventory', ctrl.updateStock);

router.get('/categories', ctrl.getCategories);
router.post('/categories', ctrl.createCategory);
router.put('/categories/:id', ctrl.updateCategory);
router.delete('/categories/:id', ctrl.deleteCategory);
router.put('/categories/reorder', ctrl.reorderCategories);

router.get('/orders', ctrl.getOrders);
router.put('/orders/:id/status', ctrl.updateOrderStatus);
router.put('/orders/:id/assign', ctrl.assignDeliveryAgent);

router.get('/users', ctrl.getUsers);
router.get('/users/:id', ctrl.getUser);
router.put('/users/:id', ctrl.updateUser);

router.get('/delivery-agents', ctrl.getDeliveryAgents);
router.post('/delivery-agents', ctrl.createDeliveryAgent);
router.put('/delivery-agents/:id', ctrl.updateDeliveryAgent);
router.delete('/delivery-agents/:id', ctrl.deleteDeliveryAgent);

router.get('/coupons', ctrl.getCoupons);
router.post('/coupons', ctrl.createCoupon);
router.get('/coupons/:id', ctrl.getCoupon);
router.put('/coupons/:id', ctrl.updateCoupon);
router.delete('/coupons/:id', ctrl.deleteCoupon);

router.get('/payments', ctrl.getPayments);
router.get('/payments/:id', ctrl.getPayment);

router.get('/delivery-areas', ctrl.getDeliveryAreas);
router.post('/delivery-areas', ctrl.createDeliveryArea);
router.put('/delivery-areas/:id', ctrl.updateDeliveryArea);
router.delete('/delivery-areas/:id', ctrl.deleteDeliveryArea);

router.get('/settings', ctrl.getSettings);
router.put('/settings', ctrl.updateSettings);

module.exports = router;