const express = require('express');
const router = express.Router();
const customerController = require('../controller/customer.controller');

// Get archived customers - move this before the :customer_id routes to prevent conflict
router.get('/archived', customerController.getArchivedCustomers);

// Get all customers with pagination and search
router.get('/', customerController.getCustomers);

// Get single customer with all details
router.get('/:customer_id', customerController.getCustomerDetails);

// Search customers
router.get('/search', customerController.searchCustomers);

// Create new customer
router.post('/', customerController.createCustomer);

// Update customer
router.put('/:customer_id', customerController.updateCustomer);

// Archive customer
router.post('/:customer_id/archive', customerController.archiveCustomer);

// Bulk archive customers
router.post('/bulk-archive', customerController.bulkArchiveCustomers);

// Restore archived customer
router.post('/:customer_id/restore', customerController.restoreCustomer);

// Get customer details
router.get('/:customer_id/details', customerController.getCustomerDetails);

module.exports = router; 