const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getProductsPaginated,
  createProduct,
  updateProduct,
  uploadProductImage
} = require('../controllers/productController');
const { authenticateToken } = require('../middleware/authMiddleware');

// GET /api/products & Retrieve all products with optional filters
router.get('/', getAllProducts);

// POST /api/products & Create a new product
router.post('/', authenticateToken, createProduct);

// POST /api/products/upload-image & Upload product image
router.post('/upload-image', authenticateToken, uploadProductImage);

// PUT /api/products/:id & Update an existing product by ID
router.put('/:id', authenticateToken, updateProduct);

// GET /api/products/paginated & Retrieve products with pagination
router.get('/paginated', getProductsPaginated);

// GET /api/products/category/:category & Retrieve products by category
router.get('/category/:category', getProductsByCategory);

// GET /api/products/:id & Retrieve a single product by ID
router.get('/:id', getProductById);

module.exports = router;
