const products = require('../data/products.json');

// GET all products & Query parameters: category, minPrice, maxPrice, search
const getAllProducts = (req, res) => {
  try {
    let filteredProducts = [...products];

    // Filter by category
    if (req.query.category) {
      filteredProducts = filteredProducts.filter(
        product => product.category.toLowerCase() === req.query.category.toLowerCase()
      );
    }

    // Filter by price range
    if (req.query.minPrice) {
      const minPrice = parseFloat(req.query.minPrice);
      filteredProducts = filteredProducts.filter(product => product.price >= minPrice);
    }

    if (req.query.maxPrice) {
      const maxPrice = parseFloat(req.query.maxPrice);
      filteredProducts = filteredProducts.filter(product => product.price <= maxPrice);
    }

    // Search by product name
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        product => product.name.toLowerCase().includes(searchTerm) ||
                   product.description.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by stock availability
    if (req.query.inStock === 'true') {
      filteredProducts = filteredProducts.filter(product => product.inStock === true);
    }

    res.status(200).json({
      success: true,
      count: filteredProducts.length,
      data: filteredProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve products',
      message: error.message
    });
  }
};

// GET a single product by ID
const getProductById = (req, res) => {
  try {
    const { id } = req.params;
    const product = products.find(p => p.id === parseInt(id));

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve product',
      message: error.message
    });
  }
};

// GET products by category
const getProductsByCategory = (req, res) => {
  try {
    const { category } = req.params;
    const categoryProducts = products.filter(
      p => p.category.toLowerCase() === category.toLowerCase()
    );

    if (categoryProducts.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No products found in category: ${category}`
      });
    }

    res.status(200).json({
      success: true,
      count: categoryProducts.length,
      category: category,
      data: categoryProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve products by category',
      message: error.message
    });
  }
};

// GET products with pagination
const getProductsPaginated = (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const totalProducts = products.length;
    const paginatedProducts = products.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      pagination: {
        page: page,
        limit: limit,
        totalProducts: totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        hasNextPage: endIndex < totalProducts,
        hasPreviousPage: page > 1
      },
      count: paginatedProducts.length,
      data: paginatedProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve paginated products',
      message: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getProductsPaginated
};
