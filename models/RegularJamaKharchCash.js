const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RegularJamaKharchCash = sequelize.define('RegularJamaKharchCash', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('JAMA', 'KHARCHA'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'regular_jama_kharch_cash',
  timestamps: true
});

module.exports = RegularJamaKharchCash;
