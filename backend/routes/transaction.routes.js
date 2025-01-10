const express = require('express');
const router = express.Router();
const transactionController = require('../controller/transaction.controller');
const { verifyToken, isPMSUser } = require('../middleware/auth.middleware');

// Report endpoints
router.get('/summary', verifyToken, isPMSUser, transactionController.getTransactionSummary);
router.get('/latest', verifyToken, isPMSUser, transactionController.getLatestTransactions);
router.get('/metrics', verifyToken, isPMSUser, transactionController.getKeyMetrics);

module.exports = router; 