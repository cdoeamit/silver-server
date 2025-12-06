const { sequelize, Product } = require('./models');
require('dotenv').config();

const migrateOldImages = async () => {
  try {
    console.log('🔄 Migrating old imageUrl to images array...');
    
    // Get all products
    const products = await Product.findAll();
    
    let updated = 0;
    
    for (const product of products) {
      // If images is empty but imageUrl exists, migrate it
      const currentImages = product.images || [];
      
      if (currentImages.length === 0 && product.imageUrl) {
        await product.update({
          images: [product.imageUrl]
        });
        updated++;
      }
    }
    
    console.log(`✅ Migrated ${updated} products`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateOldImages();