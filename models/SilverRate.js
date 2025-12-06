const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SilverRate = sequelize.define('SilverRate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true
  },
  ratePerGram: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Silver rate per gram for the day'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'silver_rates',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['date']
    }
  ]
});

// Helper method to get current rate
SilverRate.getCurrentRate = async function() {
  const today = new Date().toISOString().split('T')[0];
  let rate = await this.findOne({
    where: { date: today, isActive: true }
  });
  
  // If no rate for today, get the latest rate
  if (!rate) {
    rate = await this.findOne({
      where: { isActive: true },
      order: [['date', 'DESC']]
    });
  }
  
  return rate;
};

module.exports = SilverRate;