// backend/routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const { getInventoryStats, getMedicineAvailable, addMedicine, getCategories, deleteMedicine, deleteMedicines, getMedicineByName, deleteInEditMedicine, updateMedicineDescription } = require('../controller/InventoryController');
const { getMedicineGroups, addMedicineGroup, deleteCategory, deleteCategories, updateMedicineGroup, saveMedicineGroup, getMedicinesAndStock, updateProductStock, deleteCategoryView, deleteMultipleCategories, getLowStockProducts } = require('../controller/InventoryGroupController');

router.get('/admin/inventory', getInventoryStats);
router.get('/admin/inventory/view-medicines-available', getMedicineAvailable);
router.post('/admin/inventory/add-medicine', addMedicine);
router.get('/admin/inventory/get-categories', getCategories);
router.delete('/admin/inventory/delete-medicine/:barcode', deleteMedicine);
router.get('/admin/inventory/view-medicines-description/:medicineName', getMedicineByName);
// router.get('/admin/inventory/branches/:medicineName', getBranchInventory);
router.delete('/admin/inventory/edit-delete/:medicineName', deleteInEditMedicine);
router.put('/admin/inventory/update-medicine-description/:medicineName', updateMedicineDescription)

// MEDICINE INVENTORY
router.get('/admin/inventory/view-medicines-groups', getMedicineGroups);
router.post('/admin/add-medicine-group', addMedicineGroup);
router.delete('/admin/delete-categories/:groupName', deleteCategory);
router.post('/admin/delete-categories-multuple', deleteCategories);
router.post('/admin/group/save-medicine-group', saveMedicineGroup)
router.get('/admin/fetch-category-products/:groupName', getMedicinesAndStock)
router.post('/admin/update-product-stock', updateProductStock);
router.delete('/admin/delete-categories-view/:groupName', deleteCategoryView);
router.delete('/admin/delete-categories', deleteMultipleCategories); // Multiple deletions
router.get('/admin/short-storage', getMedicinesAndStock)


module.exports = router;
