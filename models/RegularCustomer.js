const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RegularCustomer = sequelize.define('RegularCustomer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'RegularCustomers',
  timestamps: true
});

module.exports = RegularCustomer;
