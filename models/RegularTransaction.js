const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RegularTransaction = sequelize.define('RegularTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  regularCustomerId: {
    type: DataTypes.INTEGER,
    allowNull: false,  // ✅ This is required now
    references: {
      model: 'RegularCustomers',
      key: 'id'
    }
  },
  regularSaleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'regular_sales',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('sale', 'payment', 'refund'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMode: {
    type: DataTypes.ENUM('cash', 'card', 'upi', 'bank_transfer', 'cheque', 'silver'),
    allowNull: true
  },
  referenceNumber: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  balanceBefore: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  balanceAfter: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  transactionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'regular_transactions',
  timestamps: true
});

module.exports = RegularTransaction;
