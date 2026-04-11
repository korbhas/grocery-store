const router = require('express').Router();
const ctrl = require('../controllers/productController');

router.get('/', ctrl.getProducts);
router.get('/categories', ctrl.getCategories);
router.get('/:id', ctrl.getProduct);

module.exports = router;
