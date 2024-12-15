// backend/routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const { getInventoryStats, getMedicineAvailable } = require('../controller/InventoryController');

router.get('/admin/inventory', getInventoryStats);
router.get('/admin/inventory/view-medicines-available', getMedicineAvailable);

module.exports = router;
