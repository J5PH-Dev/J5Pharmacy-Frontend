const express = require('express');
const router = express.Router();
const { searchProducts, holdTransaction, recallTransaction, deleteHeldTransaction } = require('../controllers/productController');
const { verifyToken } = require('../middleware/auth.middleware');

// Product search routes
router.get('/search', verifyToken, searchProducts);

// Hold and recall routes
router.post('/hold', verifyToken, holdTransaction);
router.get('/recall', verifyToken, recallTransaction);
router.delete('/hold/:salesSessionId/:holdNumber', verifyToken, deleteHeldTransaction);

module.exports = router; 