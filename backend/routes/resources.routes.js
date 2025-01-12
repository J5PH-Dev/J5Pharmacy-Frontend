const express = require('express');
const router = express.Router();
const resourcesController = require('../controller/resources.controller');
const { verifyToken, isPMSUser } = require('../middleware/auth.middleware');

// Apply middleware to all routes
router.use(verifyToken, isPMSUser);

// Supplier Management Routes
router.get('/suppliers', resourcesController.getAllSuppliers);
router.get('/products/:product_id/suppliers', resourcesController.getProductSuppliers);
router.post('/products/:product_id/suppliers', resourcesController.addProductSupplier);
router.put('/product-suppliers/:product_supplier_id', resourcesController.updateProductSupplier);
router.delete('/product-suppliers/:product_supplier_id', resourcesController.removeProductSupplier);

// Price Management Routes
router.get('/products/:product_id/price-history', resourcesController.getProductPriceHistory);
router.post('/products/:product_id/calculate-price', resourcesController.calculateProductPrice);

module.exports = router; 