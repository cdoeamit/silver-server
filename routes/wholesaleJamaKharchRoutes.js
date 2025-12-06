const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const wholesaleJamaKharchController = require('../controllers/wholesaleJamaKharchController');

// Silver routes
router.post('/silver', authenticate, wholesaleJamaKharchController.createSilverTransaction);
router.get('/silver', authenticate, wholesaleJamaKharchController.getSilverTransactions);
router.delete('/silver/:id', authenticate, wholesaleJamaKharchController.deleteSilverTransaction);

// Cash routes
router.post('/cash', authenticate, wholesaleJamaKharchController.createCashTransaction);
router.get('/cash', authenticate, wholesaleJamaKharchController.getCashTransactions);
router.delete('/cash/:id', authenticate, wholesaleJamaKharchController.deleteCashTransaction);

module.exports = router;
