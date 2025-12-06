const { sequelize } = require('./config/database');
const { User } = require('./models');
require('dotenv').config();

const syncGender = async () => {
  try {
    console.log('🔄 Syncing database to add gender field...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
};

syncGender();