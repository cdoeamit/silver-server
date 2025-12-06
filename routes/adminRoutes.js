const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getDashboardStats,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/adminController');

router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;