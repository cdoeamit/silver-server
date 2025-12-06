require('dotenv').config();
const { sequelize } = require('./models');

async function syncBillingDatabase() {
  try {
    console.log('🔄 Starting billing database synchronization...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync all models with alter (updates existing tables)
    await sequelize.sync({ alter: true });
    console.log('✅ All billing tables synchronized');

    // Optional: Seed default silver rate
    const { SilverRate } = require('./models');
    const today = new Date().toISOString().split('T')[0];
    
    const [rate, created] = await SilverRate.findOrCreate({
      where: { date: today },
      defaults: {
        date: today,
        ratePerGram: 100.00 // Default rate, change as needed
      }
    });

    if (created) {
      console.log(`✅ Default silver rate created for ${today}: ₹${rate.ratePerGram}/gram`);
    } else {
      console.log(`ℹ️ Silver rate already exists for ${today}: ₹${rate.ratePerGram}/gram`);
    }

    console.log('✅ Billing database sync completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error syncing billing database:', error);
    process.exit(1);
  }
}

syncBillingDatabase();