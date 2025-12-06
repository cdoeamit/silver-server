const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Customer routes
router.post('/customers', billingController.getOrCreateCustomer);
router.get('/customers', billingController.getAllCustomers);
router.get('/customers/:customerId/ledger', billingController.getCustomerLedger);

// Silver rate routes
router.get('/silver-rate/current', billingController.getCurrentSilverRate);
router.post('/silver-rate', billingController.setSilverRate);
router.get('/silver-rate/history', billingController.getSilverRatesHistory);

// Sales routes
router.post('/sales', billingController.createSale);
router.get('/sales', billingController.getAllSales);
router.get('/sales/:saleId', billingController.getSaleDetails);
router.post('/sales/:saleId/payment', billingController.addPayment);
router.post('/sales/:saleId/silver-return', billingController.addSilverReturn);
// Add silver payment to a sale
router.post('/sales/:id/silver-payment',authenticate,billingController.addSilverPayment);

// Stats
router.get('/stats', billingController.getBillingStats);

// IMPORTANT: Export routes MUST come at the END
router.get('/export/customers', billingController.exportCustomersToExcel);
router.get('/export/sales', billingController.exportSalesToExcel);

// Daily analysis route
router.get('/daily-analysis', billingController.getDailyAnalysis);

module.exports = router;
