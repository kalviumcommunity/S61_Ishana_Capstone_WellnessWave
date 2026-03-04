const Product = require('../models/Product');

// GET all unique categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    categories.sort((a, b) => a.localeCompare(b));

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
const getCategoryDetails = async (req, res) => {
  try {
    const categoryDetails = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          productCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          productCount: 1
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

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
