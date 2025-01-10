const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboard.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Dashboard routes
router.get('/overview', verifyToken, dashboardController.getDashboardOverview);
router.get('/recent-transactions', verifyToken, dashboardController.getRecentTransactions);
router.get('/low-stock', verifyToken, dashboardController.getLowStockItems);

module.exports = router; 