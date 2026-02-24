const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getProductsPaginated
} = require('../controllers/productController');

// GET /api/products & Retrieve all products with optional filters
router.get('/', getAllProducts);

// GET /api/products/paginated & Retrieve products with pagination
router.get('/paginated', getProductsPaginated);

// GET /api/products/category/:category & Retrieve products by category
router.get('/category/:category', getProductsByCategory);

// GET /api/products/:id & Retrieve a single product by ID
router.get('/:id', getProductById);

module.exports = router;
