// backend/routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controller/InventoryController');
const inventoryGroupController = require('../controller/InventoryGroupController');

// Inventory routes
router.get('/admin/inventory/stats', inventoryController.getInventoryStats);
router.get('/admin/inventory/view-medicines-available', inventoryController.getMedicineAvailable);
router.get('/admin/inventory/view-medicines-description/:medicineName', inventoryController.getMedicineByName);
router.get('/admin/inventory/categories', inventoryController.getCategories);
router.get('/admin/inventory/archived-products', inventoryController.getArchivedProducts);
router.get('/admin/inventory/branches', inventoryController.getBranches);
router.get('/admin/inventory/critical-products', inventoryController.getCriticalProducts);
router.get('/admin/inventory/archived-categories', inventoryController.getArchivedCategories);
router.get('/admin/inventory/category-products/:categoryId', inventoryGroupController.getCategoryProducts);
router.get('/admin/inventory/next-barcode/:categoryId', inventoryGroupController.getNextBarcode);

// POST routes
router.post('/admin/inventory/add-medicine', inventoryController.addMedicine);
router.post('/admin/inventory/edit-medicine/:medicineName', inventoryController.updateMedicineDescription);
router.post('/admin/inventory/update-branch-inventory', inventoryController.updateBranchInventory);
router.post('/admin/inventory/archive-product/:barcode', inventoryController.archiveProduct);
router.post('/admin/inventory/archive-category/:categoryId', inventoryGroupController.archiveCategory);
router.post('/admin/inventory/restore-category/:categoryId', inventoryController.restoreCategory);
router.post('/admin/inventory/add-category', inventoryGroupController.addMedicineGroup);
router.post('/admin/inventory/update-category', inventoryGroupController.updateMedicineGroup);
router.post('/admin/inventory/restore-product/:barcode', inventoryController.restoreProduct);

// DELETE routes
router.delete('/admin/inventory/delete/:barcode', inventoryController.deleteMedicine);
router.delete('/admin/inventory/delete-multiple', inventoryController.deleteMedicines);
router.delete('/admin/inventory/edit-delete/:medicineName', inventoryController.deleteInEditMedicine);

module.exports = router;
