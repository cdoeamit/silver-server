const { sequelize } = require('./config/database');
const { testConnection } = require('./config/database');
require('dotenv').config();

const syncDatabase = async () => {
  try {
    console.log('🔄 Syncing database schema...');
    
    // Test connection first
    await testConnection();
    
    // Use alter: true to modify existing tables without dropping data
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database schema synced successfully!');
    console.log('✅ New "images" column added to products table');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
};

syncDatabase();