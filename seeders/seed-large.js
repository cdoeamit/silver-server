const { sequelize, Category, Product } = require('../models');
require('dotenv').config();

const generateProducts = (categoryId, categoryName, count) => {
  const products = [];
  const baseNames = {
    LADIES: ['Ring', 'Necklace', 'Bracelet', 'Earrings', 'Pendant', 'Anklet', 'Bangle'],
    GENTS: ['Ring', 'Bracelet', 'Chain', 'Cufflinks', 'Pendant', 'Watch Band'],
    LORDS: ['Ring', 'Pendant', 'Chain', 'Bracelet', 'Signet Ring', 'Cross']
  };

  const adjectives = ['Elegant', 'Classic', 'Modern', 'Vintage', 'Ornate', 'Delicate', 'Bold', 'Intricate', 'Timeless', 'Exquisite'];
  const styles = ['Floral', 'Geometric', 'Celtic', 'Art Deco', 'Minimalist', 'Baroque', 'Byzantine', 'Gothic'];

  // Sample image URLs (mix of placeholder and real)
  const sampleImages = [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400',
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
    'https://via.placeholder.com/400x400?text=Silver+Jewelry'
  ];

  const names = baseNames[categoryName] || baseNames.LADIES;

  for (let i = 0; i < count; i++) {
    const name = names[i % names.length];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const style = styles[Math.floor(Math.random() * styles.length)];
    
    // Generate 4-5 images per product
    const productImages = [];
    const imageCount = 4 + Math.floor(Math.random() * 2); // 4 or 5 images
    for (let j = 0; j < imageCount; j++) {
      productImages.push(sampleImages[j % sampleImages.length]);
    }

    products.push({
      name: `${adjective} ${style} ${name} ${i + 1}`,
      description: `Handcrafted ${style.toLowerCase()} ${name.toLowerCase()} featuring intricate silver work and timeless design. Perfect for ${categoryName.toLowerCase()} collection.`,
      price: (20 + Math.random() * 180).toFixed(2),
      silverWeight: (5 + Math.random() * 25).toFixed(2),
      images: productImages,
      categoryId: categoryId,
      stock: Math.floor(Math.random() * 50) + 5,
      sku: `${categoryName.substring(0, 3)}-${name.substring(0, 4).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
      isActive: true,
      isFeatured: Math.random() > 0.9
    });
  }

  return products;
};

const seedLarge = async () => {
  try {
    console.log('🌱 Starting large database seed...');

    const categories = await Category.findAll();
    
    if (categories.length === 0) {
      console.error('❌ No categories found. Run basic seeder first.');
      process.exit(1);
    }

    // Delete existing products
    await Product.destroy({ where: {} });
    console.log('✅ Cleared existing products');

    const allProducts = [];

    // Generate 100 products per category
    categories.forEach(category => {
      const products = generateProducts(category.id, category.name, 100);
      allProducts.push(...products);
    });

    // Bulk create
    await Product.bulkCreate(allProducts);

    console.log(`✅ Created ${allProducts.length} products`);
    console.log('\n📊 Summary:');
    console.log(`   Total Products: ${allProducts.length}`);
    console.log(`   Products per category: ~100`);
    console.log(`   Each product has: 4-5 images`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedLarge();