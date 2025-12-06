const { Product, Category, User } = require('../models');
const { sequelize } = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    // Get total silver and monetary value
    const totalSilverResult = await Product.findOne({
      attributes: [
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('silverWeight')), 0), 'totalWeight'],
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('price')), 0), 'totalValue']
      ],
      where: { isActive: true },
      raw: true
    });

    // Get counts
    const totalProducts = await Product.count({ where: { isActive: true } });
    const totalUsers = await User.count({ where: { role: 'user', isActive: true } });
    const totalCategories = await Category.count({ where: { isActive: true } });

    // Get category stats with proper handling
    const categoryStats = await sequelize.query(`
      SELECT 
        c.id as categoryId,
        c.name as categoryName,
        COUNT(p.id) as productCount,
        COALESCE(SUM(p.silverWeight), 0) as totalSilverWeight
      FROM categories c
      LEFT JOIN products p ON c.id = p.categoryId AND p.isActive = 1
      WHERE c.isActive = 1
      GROUP BY c.id, c.name
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    return res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalSilverWeight: parseFloat(totalSilverResult.totalWeight || 0).toFixed(2),
          totalMonetaryValue: parseFloat(totalSilverResult.totalValue || 0).toFixed(2),
          totalProducts,
          totalUsers,
          totalCategories
        },
        categoryBreakdown: categoryStats.map(cat => ({
          categoryId: cat.categoryId,
          categoryName: cat.categoryName,
          productCount: parseInt(cat.productCount || 0),
          totalSilverWeight: parseFloat(cat.totalSilverWeight || 0).toFixed(2)
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      silverWeight,
      images,
      categoryId,
      stock,
      sku,
      isFeatured
    } = req.body;

    if (!name || !price || !silverWeight || !images || !categoryId) {
      return res.status(400).json({
        status: 'error',
        message: 'Required fields: name, price, silverWeight, images, categoryId'
      });
    }

    // Validate images is an array
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one image is required'
      });
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      silverWeight,
      images,
      categoryId,
      stock: stock || 0,
      sku,
      isFeatured: isFeatured || false,
      isActive: true
    });

    const productWithCategory = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category' }]
    });

    return res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: { product: productWithCategory }
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create product'
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    if (updates.categoryId) {
      const category = await Category.findByPk(updates.categoryId);
      if (!category) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found'
        });
      }
    }

    await product.update(updates);

    const updatedProduct = await Product.findByPk(id, {
      include: [{ model: Category, as: 'category' }]
    });

    return res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update product'
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    await product.update({ isActive: false });

    return res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete product'
    });
  }
};

module.exports = {
  getDashboardStats,
  createProduct,
  updateProduct,
  deleteProduct
};