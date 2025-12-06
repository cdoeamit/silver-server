const express = require('express');
const router = express.Router();
const regularBillingController = require('../controllers/regularBillingController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.use(requireAdmin);

// Customer routes (using RegularCustomer)
router.get('/customers', regularBillingController.getAllCustomers);
router.get('/customers/:customerId/ledger', regularBillingController.getCustomerLedger);
router.post('/customers', regularBillingController.createCustomer);
router.put('/customers/:customerId', regularBillingController.updateCustomer);
router.delete('/customers/:customerId', regularBillingController.deleteCustomer);

// Regular Sale Routes
router.post('/sales', regularBillingController.createRegularSale);
router.get('/sales', regularBillingController.getAllRegularSales);
router.get('/sales/:saleId', regularBillingController.getRegularSaleDetails);
router.post('/sales/:saleId/payment', regularBillingController.addPayment);
router.post('/sales/:id/silver-payment', authenticate, regularBillingController.addSilverPayment);

// Stats and reports
router.get('/stats', regularBillingController.getRegularBillingStats);
router.get('/daily-analysis', regularBillingController.getDailyAnalysis);

// Export routes
router.get('/export/sales', regularBillingController.exportSalesToExcel);
router.get('/export/customers', regularBillingController.exportCustomersToExcel);

module.exports = router;
