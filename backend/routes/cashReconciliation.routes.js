const express = require('express');
const router = express.Router();
const cashReconciliationController = require('../controller/cashReconciliation.controller');
const { verifyToken, isPharmacist } = require('../middleware/auth.middleware');

// Get session summary for reconciliation
router.get(
    '/session-summary/:sessionId',
    [verifyToken, isPharmacist],
    cashReconciliationController.getSessionSummary
);

// Save cash reconciliation
router.post(
    '/save',
    [verifyToken, isPharmacist],
    cashReconciliationController.saveCashReconciliation
);

// Check if session has transactions
router.get(
    '/check-transactions/:sessionId',
    [verifyToken, isPharmacist],
    cashReconciliationController.checkSessionTransactions
);

module.exports = router; 