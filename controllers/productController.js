const { Product, Category } = require('../models');
const { Op } = require('sequelize');

const getAllProducts = async (req, res) => {
  try {
    const { category, featured, search, limit = 50, offset = 0 } = req.query;

    const where = { isActive: true };

    if (category) {
      const categoryRecord = await Category.findOne({ 
        where: { name: category.toUpperCase() } 
      });
      if (categoryRecord) {
        where.categoryId = categoryRecord.id;
      }
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const products = await Product.findAndCountAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'displayOrder']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      status: 'success',
      data: {
        products: products.rows,
        total: products.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch products'
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: { id, isActive: true },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'displayOrder']
      }]
    });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch product'
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['displayOrder', 'ASC']],
      include: [{
        model: Product,
        as: 'products',
        where: { isActive: true },
        required: false,
        attributes: ['id']
      }]
    });

    const categoriesWithCount = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      displayOrder: cat.displayOrder,
      description: cat.description,
      productCount: cat.products.length
    }));

    return res.status(200).json({
      status: 'success',
      data: { categories: categoriesWithCount }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch categories'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getCategories
};