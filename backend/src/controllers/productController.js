const Product = require('../models/Product');
const Category = require('../models/Category');

const formatProductResponse = (productDoc) => {
  const product = productDoc.toObject ? productDoc.toObject() : productDoc;
  let categoryValue = product.category;

  if (product.category && typeof product.category === 'object' && product.category.name) {
    categoryValue = product.category.name;
  }

  return {
    ...product,
    category: categoryValue
  };
};

const resolveCategory = async (categoryInput) => {
  if (!categoryInput) {
    return null;
  }

  const categoryValue = String(categoryInput).trim();

  if (!categoryValue) {
    return null;
  }

  if (categoryValue.match(/^[0-9a-fA-F]{24}$/)) {
    const categoryById = await Category.findById(categoryValue);
    if (categoryById) {
      return categoryById;
    }
  }

  const normalizedName = categoryValue.replace(/\s+/g, ' ').trim();
  const categoryByName = await Category.findOne({
    name: new RegExp(`^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
  });

  if (categoryByName) {
    return categoryByName;
  }

  return Category.create({ name: normalizedName });
};

// GET all products & Query parameters: category, minPrice, maxPrice, search
const getAllProducts = async (req, res) => {
  try {
    const query = {};

    if (req.query.category) {
      const categoryFilter = String(req.query.category).trim();
      const categoryMatch = await Category.findOne({
        name: new RegExp(`^${categoryFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      });

      if (!categoryMatch) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: []
        });
      }

      query.category = categoryMatch._id;
    }

    if (req.query.minPrice) {
      const minPrice = parseFloat(req.query.minPrice);
      if (!Number.isNaN(minPrice)) {
        query.price = { ...(query.price || {}), $gte: minPrice };
      }
    }

    if (req.query.maxPrice) {
      const maxPrice = parseFloat(req.query.maxPrice);
      if (!Number.isNaN(maxPrice)) {
        query.price = { ...(query.price || {}), $lte: maxPrice };
      }
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.inStock === 'true') {
      query.inStock = true;
    }

    const filteredProducts = await Product.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: filteredProducts.length,
      data: filteredProducts.map(formatProductResponse)
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
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('category', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: formatProductResponse(product)
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
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const categoryMatch = await Category.findOne({
      name: new RegExp(`^${String(category).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (!categoryMatch) {
      return res.status(404).json({
        success: false,
        error: `No products found in category: ${category}`
      });
    }

    const categoryProducts = await Product.find({
      category: categoryMatch._id
    })
      .populate('category', 'name')
      .sort({ createdAt: -1 });

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
      data: categoryProducts.map(formatProductResponse)
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
const getProductsPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const totalProducts = await Product.countDocuments();
    const paginatedProducts = await Product.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    const endIndex = startIndex + paginatedProducts.length;

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
      data: paginatedProducts.map(formatProductResponse)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve paginated products',
      message: error.message
    });
  }
};

// POST create a new product
const createProduct = async (req, res) => {
  try {
    const { name, category, price, description, image, inStock, quantity } = req.body;

    if (!name || !category || price === undefined || !description || !image || quantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        requiredFields: ['name', 'category', 'price', 'description', 'image', 'quantity']
      });
    }

    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0 || Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid price or quantity'
      });
    }

    const resolvedCategory = await resolveCategory(category);

    if (!resolvedCategory) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category'
      });
    }

    const newProduct = {
      name: String(name).trim(),
      category: resolvedCategory._id,
      price: parsedPrice,
      description: String(description).trim(),
      image: String(image).trim(),
      inStock: typeof inStock === 'boolean' ? inStock : parsedQuantity > 0,
      quantity: parsedQuantity
    };

    const createdProduct = await Product.create(newProduct);
    const populatedProduct = await Product.findById(createdProduct._id).populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: formatProductResponse(populatedProduct)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
      message: error.message
    });
  }
};

// PUT update an existing product by ID
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const { name, category, price, description, image, inStock, quantity } = req.body;
    const updatedProduct = {
      name: existingProduct.name,
      category: existingProduct.category,
      price: existingProduct.price,
      description: existingProduct.description,
      image: existingProduct.image,
      inStock: existingProduct.inStock,
      quantity: existingProduct.quantity
    };

    if (name !== undefined) {
      updatedProduct.name = String(name).trim();
    }

    if (category !== undefined) {
      const resolvedCategory = await resolveCategory(category);

      if (!resolvedCategory) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category'
        });
      }

      updatedProduct.category = resolvedCategory._id;
    }

    if (description !== undefined) {
      updatedProduct.description = String(description).trim();
    }

    if (image !== undefined) {
      updatedProduct.image = String(image).trim();
    }

    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid price'
        });
      }
      updatedProduct.price = parsedPrice;
    }

    if (quantity !== undefined) {
      const parsedQuantity = Number(quantity);
      if (Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid quantity'
        });
      }
      updatedProduct.quantity = parsedQuantity;

      if (inStock === undefined) {
        updatedProduct.inStock = parsedQuantity > 0;
      }
    }

    if (inStock !== undefined) {
      updatedProduct.inStock = Boolean(inStock);
    }

    const savedProduct = await Product.findByIdAndUpdate(id, updatedProduct, {
      new: true,
      runValidators: true
    }).populate('category', 'name');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: formatProductResponse(savedProduct)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
      message: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getProductsPaginated,
  createProduct,
  updateProduct
};
