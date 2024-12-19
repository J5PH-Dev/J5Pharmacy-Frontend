const express = require('express');
const router = express.Router();
const transactionController = require('../controller/transaction.controller');
const { verifyToken, isPharmacist } = require('../middleware/auth.middleware');

// Create new transaction
router.post('/create', verifyToken, isPharmacist, transactionController.createTransaction);

// Get transaction summary
router.get('/summary', verifyToken, transactionController.getTransactionSummary);

// Star points routes
router.get('/star-points/:customer_id', verifyToken, transactionController.getCustomerStarPoints);
router.post('/star-points/redeem', verifyToken, isPharmacist, transactionController.redeemStarPoints);

module.exports = router; 