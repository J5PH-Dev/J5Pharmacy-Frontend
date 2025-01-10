const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboard.controller');
const { verifyToken, isPMSUser } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(isPMSUser);

// Dashboard overview data
router.get('/overview', dashboardController.getDashboardOverview);

// Recent transactions
router.get('/recent-transactions', dashboardController.getRecentTransactions);

// Low stock items
router.get('/low-stock', dashboardController.getLowStockItems);

module.exports = router; 