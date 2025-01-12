const express = require('express');
const router = express.Router();
const devController = require('../controller/dev.controller');
const { verifyToken, isPMSUser } = require('../middleware/auth.middleware');

// Only enable these routes in development environment
if (process.env.NODE_ENV === 'development') {
    // Get branches for dev tools
    router.get('/branches', [verifyToken, isPMSUser], devController.getBranches);
    
    // Generate test transaction
    router.post('/generate-transaction', [verifyToken, isPMSUser], devController.generateTransaction);
}

module.exports = router; 