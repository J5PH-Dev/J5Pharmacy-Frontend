// backend/routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const { getInventoryStats, getMedicineAvailable, addMedicine, getCategories } = require('../controller/InventoryController');

router.get('/admin/inventory', getInventoryStats);
router.get('/admin/inventory/view-medicines-available', getMedicineAvailable);
router.post('/admin/inventory/view-medicines-available', addMedicine);
router.get('/admin/inventory/get-categories', getCategories);

module.exports = router;
