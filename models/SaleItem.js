const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SaleItem = sequelize.define('SaleItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  saleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sales',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Item description/label'
  },
  pieces: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  grossWeight: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    comment: 'Gross weight in grams'
  },
  stoneWeight: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    defaultValue: 0,
    comment: 'Stone weight in grams'
  },
  netWeight: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    comment: 'Net weight (gross - stone) in grams'
  },
  wastage: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    defaultValue: 0,
    comment: 'Wastage in grams'
  },
  touch: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Touch/purity as decimal (e.g., 13.00, 92.5)'
  },
  silverWeight: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    defaultValue: 0,
    comment: 'Silver = (wastage + touch) × netWeight / 100'
  },
  laborRatePerKg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Labor rate per KG for this specific item'
  },
  laborCharges: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Calculated as: grossWeight × laborRatePerKg / 1000'
  },
  itemAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'silverWeight × silverRate + laborCharges'
  }
}, {
  tableName: 'sale_items',
  timestamps: true
});

module.exports = SaleItem;
