const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RegularJamaKharchSilver = sequelize.define('RegularJamaKharchSilver', {
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
  silverType: {
    type: DataTypes.ENUM('fine', 'raw'),
    defaultValue: 'fine'
  },
  silverWeight: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true
  },
  formNo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  grossWeight: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true
  },
  touch: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  totalSilver: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true
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
  tableName: 'regular_jama_kharch_silver',
  timestamps: true
});

module.exports = RegularJamaKharchSilver;
