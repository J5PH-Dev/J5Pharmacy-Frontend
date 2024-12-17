const express = require('express');
const router = express.Router();
const salesController = require('./controllers/salesController');

router.get('/api/sales', salesController.getSalesData);

module.exports = router;