const { sequelize } = require('./config/database');
require('dotenv').config();

const migrateImages = async () => {
  try {
    console.log('🔄 Migrating product images field...');
    
    // Add images column and migrate data
    await sequelize.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS images JSON DEFAULT '[]'
    `);

    // Migrate existing imageUrl to images array
    await sequelize.query(`
      UPDATE products 
      SET images = JSON_ARRAY(imageUrl)
      WHERE images IS NULL OR JSON_LENGTH(images) = 0
    `);

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateImages();