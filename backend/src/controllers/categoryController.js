const Category = require('../models/Category');

// GET all unique categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).select('name');

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories.map((category) => category.name)
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
    const categoryDetails = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$name',
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
