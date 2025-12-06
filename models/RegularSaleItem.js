const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RegularSaleItem = sequelize.define('RegularSaleItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  regularSaleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'regular_sales',
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
    type: DataTypes.STRING(255),
    allowNull: false
  },
  pieces: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  grossWeight: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  stoneWeight: {
    type: DataTypes.DECIMAL(10, 3),
    defaultValue: 0
  },
  netWeight: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  wastage: {
    type: DataTypes.DECIMAL(10, 3),
    defaultValue: 0
  },
  touch: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  silverWeight: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  laborRatePerKg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Labor rate per KG for this specific item'
  },
  laborCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  itemAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'regular_sale_items',
  timestamps: true
});

module.exports = RegularSaleItem;
