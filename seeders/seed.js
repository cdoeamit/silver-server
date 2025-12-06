const { sequelize, User, Category, Product } = require('../models');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Force sync (DROP and recreate tables)
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created');

    // Seed Categories
    const categories = await Category.bulkCreate([
      {
        name: 'LADIES',
        displayOrder: 1,
        description: 'Elegant silver jewelry designed for women',
        isActive: true
      },
      {
        name: 'GENTS',
        displayOrder: 2,
        description: 'Sophisticated silver pieces for men',
        isActive: true
      },
      {
        name: 'LORDS',
        displayOrder: 3,
        description: 'Exquisite craftsmanship for the elite',
        isActive: true
      }
    ]);
    console.log('✅ Categories seeded');

    // Seed Users
    const users = await User.bulkCreate([
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@argentum.com',
        password: 'admin123',
        role: 'admin',
        phone: '+1234567890',
        isActive: true
      },
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'user123',
        role: 'user',
        phone: '+1234567891',
        isActive: true
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'user123',
        role: 'user',
        phone: '+1234567892',
        isActive: true
      }
    ]);
    console.log('✅ Users seeded');

    // Seed Products
    const products = await Product.bulkCreate([
      // LADIES Category Products
      {
        name: "Orion's Tear - Silver Ring",
        description: 'Elegant silver ring with intricate floral design and blue moonstone',
        price: 42.00,
        silverWeight: 8.5,
        imageUrl: 'https://drive.google.com/uc?id=placeholder1',
        categoryId: categories[0].id,
        stock: 15,
        sku: 'LAD-RING-001',
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Moonlit Pendant Necklace',
        description: 'Delicate layered necklace with blue teardrop stone',
        price: 56.00,
        silverWeight: 12.3,
        imageUrl: 'https://drive.google.com/uc?id=placeholder2',
        categoryId: categories[0].id,
        stock: 20,
        sku: 'LAD-NECK-001',
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Celestial Bracelet',
        description: 'Ornate silver bracelet with detailed patterns',
        price: 29.00,
        silverWeight: 6.8,
        imageUrl: 'https://drive.google.com/uc?id=placeholder3',
        categoryId: categories[0].id,
        stock: 25,
        sku: 'LAD-BRAC-001',
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Teardrop Earrings',
        description: 'Classic silver earrings with blue stones',
        price: 13.00,
        silverWeight: 3.2,
        imageUrl: 'https://drive.google.com/uc?id=placeholder4',
        categoryId: categories[0].id,
        stock: 30,
        sku: 'LAD-EAR-001',
        isActive: true,
        isFeatured: false
      },

      // GENTS Category Products
      {
        name: 'Executive Watch Band Ring',
        description: 'Modern silver ring with watch-inspired design',
        price: 89.00,
        silverWeight: 15.7,
        imageUrl: 'https://drive.google.com/uc?id=placeholder5',
        categoryId: categories[1].id,
        stock: 10,
        sku: 'GEN-RING-001',
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Classic Chain Link Bracelet',
        description: 'Bold silver bracelet with interlocking links',
        price: 78.00,
        silverWeight: 22.4,
        imageUrl: 'https://drive.google.com/uc?id=placeholder6',
        categoryId: categories[1].id,
        stock: 12,
        sku: 'GEN-BRAC-001',
        isActive: true,
        isFeatured: false
      },

      // LORDS Category Products
      {
        name: 'Dragon Guardian Pendant',
        description: 'Majestic dragon-themed pendant with intricate details',
        price: 120.00,
        silverWeight: 28.5,
        imageUrl: 'https://drive.google.com/uc?id=placeholder7',
        categoryId: categories[2].id,
        stock: 5,
        sku: 'LOR-PEND-001',
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Skull King Ring',
        description: 'Bold statement ring featuring detailed skull design',
        price: 99.00,
        silverWeight: 18.9,
        imageUrl: 'https://drive.google.com/uc?id=placeholder8',
        categoryId: categories[2].id,
        stock: 8,
        sku: 'LOR-RING-001',
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Wolf Spirit Ring',
        description: 'Fierce wolf head ring with emerald eyes',
        price: 96.00,
        silverWeight: 17.2,
        imageUrl: 'https://drive.google.com/uc?id=placeholder9',
        categoryId: categories[2].id,
        stock: 6,
        sku: 'LOR-RING-002',
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Royal Pattern Band',
        description: 'Elegant band with intricate royal patterns',
        price: 58.00,
        silverWeight: 11.3,
        imageUrl: 'https://drive.google.com/uc?id=placeholder10',
        categoryId: categories[2].id,
        stock: 10,
        sku: 'LOR-BAND-001',
        isActive: true,
        isFeatured: false
      }
    ]);
    console.log('✅ Products seeded');

    console.log('\n📊 Seed Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n🔐 Test Credentials:');
    console.log('   Admin: admin@argentum.com / admin123');
    console.log('   User: john@example.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();