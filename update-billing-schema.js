const { sequelize } = require('./config/database');

async function updateSchema() {
  try {
    console.log('🔄 Updating billing schema...');
    
    // Update Sale model billingType enum to add 'production'
    await sequelize.query(`
      ALTER TABLE sales 
      MODIFY COLUMN billingType ENUM('regular', 'wholesale', 'production') 
      NOT NULL DEFAULT 'regular'
      COMMENT 'regular = old regular, wholesale = with GST option + silver return, production = registered users only, no GST'
    `);
    
    console.log('✅ Schema updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateSchema();
