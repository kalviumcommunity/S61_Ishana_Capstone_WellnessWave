const products = require('../data/products.json');

// GET all unique categories
const getAllCategories = (req, res) => {
  try {
    const categories = [...new Set(products.map(p => p.category))].sort();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve categories',
      message: error.message
    });
  }
};

//GET category details with product count
const getCategoryDetails = (req, res) => {
  try {
    const categories = [...new Set(products.map(p => p.category))].sort();
    
    const categoryDetails = categories.map(category => ({
      name: category,
      productCount: products.filter(p => p.category === category).length
    }));

    res.status(200).json({
      success: true,
      count: categoryDetails.length,
      data: categoryDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve category details',
      message: error.message
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryDetails
};
