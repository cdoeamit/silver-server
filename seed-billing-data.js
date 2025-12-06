require('dotenv').config();
const { Customer, SilverRate } = require('./models');

async function seedBillingData() {
  try {
    console.log('🌱 Starting billing data seeding...');

    // Seed sample customers
    const customers = [
      {
        name: 'RAJ AVATE',
        phone: '8421091966',
        email: 'raj.avate@example.com',
        address: 'Rajkot, Gujarat',
        balance: 0
      },
      {
        name: 'Priya Sharma',
        phone: '9876543210',
        email: 'priya.sharma@example.com',
        address: 'Mumbai, Maharashtra',
        gstNumber: '27ABCDE1234F1Z5',
        balance: 0
      },
      {
        name: 'Amit Patel',
        phone: '9988776655',
        email: 'amit.patel@example.com',
        address: 'Ahmedabad, Gujarat',
        balance: 0
      }
    ];

    for (const customerData of customers) {
      const [customer, created] = await Customer.findOrCreate({
        where: { phone: customerData.phone },
        defaults: customerData
      });
      
      if (created) {
        console.log(`✅ Customer created: ${customer.name}`);
      } else {
        console.log(`ℹ️ Customer already exists: ${customer.name}`);
      }
    }

    // Seed silver rates for last 7 days
    const rates = [
      { date: '2025-10-13', ratePerGram: 99.50 },
      { date: '2025-10-14', ratePerGram: 100.00 },
      { date: '2025-10-15', ratePerGram: 100.50 },
      { date: '2025-10-16', ratePerGram: 101.00 },
      { date: '2025-10-17', ratePerGram: 101.50 },
      { date: '2025-10-18', ratePerGram: 102.00 },
      { date: '2025-10-19', ratePerGram: 102.50 }
    ];

    for (const rateData of rates) {
      const [rate, created] = await SilverRate.findOrCreate({
        where: { date: rateData.date },
        defaults: rateData
      });
      
      if (created) {
        console.log(`✅ Silver rate created for ${rate.date}: ₹${rate.ratePerGram}/gram`);
      } else {
        console.log(`ℹ️ Silver rate already exists for ${rate.date}: ₹${rate.ratePerGram}/gram`);
      }
    }

    console.log('✅ Billing data seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding billing data:', error);
    process.exit(1);
  }
}

seedBillingData();