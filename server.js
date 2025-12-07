const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { sequelize } = require('./config/database');
const { testConnection } = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const billingRoutes = require('./routes/billingRoutes');
const regularBillingRoutes = require('./routes/regularBillingRoutes');
const wholesaleJamaKharchRoutes = require('./routes/wholesaleJamaKharchRoutes');
const regularJamaKharchRoutes = require('./routes/regularJamaKharchRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: 'https://silveer-forntend.vercel.app',
  credentials: true
}));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/regular-billing', regularBillingRoutes);
app.use('/api/wholesale-jama-kharch', wholesaleJamaKharchRoutes);
app.use('/api/regular-jama-kharch', regularJamaKharchRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();
    await sequelize.sync({ alter: false });
    console.log('✅ Database tables synchronized');
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
