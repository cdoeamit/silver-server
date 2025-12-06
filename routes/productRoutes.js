const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getCategories
} = require('../controllers/productController');

router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

module.exports = router;