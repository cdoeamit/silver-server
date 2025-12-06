const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const regularJamaKharchController = require('../controllers/regularJamaKharchController');

// Silver routes
router.post('/silver', authenticate, regularJamaKharchController.createSilverTransaction);
router.get('/silver', authenticate, regularJamaKharchController.getSilverTransactions);
router.delete('/silver/:id', authenticate, regularJamaKharchController.deleteSilverTransaction);

// Cash routes
router.post('/cash', authenticate, regularJamaKharchController.createCashTransaction);
router.get('/cash', authenticate, regularJamaKharchController.getCashTransactions);
router.delete('/cash/:id', authenticate, regularJamaKharchController.deleteCashTransaction);

module.exports = router;
