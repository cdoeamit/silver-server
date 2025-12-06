const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RegularSale = sequelize.define('RegularSale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  voucherNumber: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  regularCustomerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'RegularCustomers',
      key: 'id'
    }
  },
  saleDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  silverRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  totalNetWeight: {
    type: DataTypes.DECIMAL(10, 3),
    defaultValue: 0
  },
  totalWastage: {
    type: DataTypes.DECIMAL(10, 3),
    defaultValue: 0
  },
  totalSilverWeight: {
    type: DataTypes.DECIMAL(10, 3),
    defaultValue: 0
  },
  totalLaborCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  paidSilver: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    defaultValue: 0,
    comment: 'Silver weight paid/returned in grams'
  },
  balanceAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  previousBalance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  closingBalance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  paymentMode: {
    type: DataTypes.ENUM('cash', 'card', 'upi', 'bank_transfer', 'cheque'),
    defaultValue: 'cash'
  },
  status: {
    type: DataTypes.ENUM('pending', 'partial', 'paid', 'cancelled'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'regular_sales',
  timestamps: true
});

RegularSale.associate = (models) => {
  RegularSale.belongsTo(models.RegularCustomer, {
    foreignKey: 'regularCustomerId',
    as: 'customer'
  });
};

module.exports = RegularSale;
