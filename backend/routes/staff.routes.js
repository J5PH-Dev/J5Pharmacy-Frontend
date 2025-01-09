const express = require('express');
const router = express.Router();
const staffController = require('../controller/staff.controller');
const { verifyToken, isPMSUser, isAdmin } = require('../middleware/auth.middleware');

// Apply middleware to all routes
router.use(verifyToken, isPMSUser);

// User management routes
router.get('/users', staffController.getAllUsers);
router.post('/users', isAdmin, staffController.createUser);
router.put('/users/:userId', isAdmin, staffController.updateUser);
router.delete('/users/:userId', isAdmin, staffController.archiveUser);
router.post('/users/upload-image/:userId', staffController.uploadUserImage);
router.put('/users/:userId/archive', isAdmin, staffController.archiveUser);
router.put('/users/:userId/restore', isAdmin, staffController.restoreUser);

// Pharmacist management routes
router.get('/pharmacists', staffController.getAllPharmacists);
router.post('/pharmacists', isAdmin, staffController.createPharmacist);
router.put('/pharmacists/:staffId', isAdmin, staffController.updatePharmacist);
router.delete('/pharmacists/:staffId', isAdmin, staffController.archivePharmacist);
router.post('/pharmacists/upload-image/:staffId', staffController.uploadPharmacistImage);
router.put('/pharmacists/:staffId/archive', isAdmin, staffController.archivePharmacist);
router.put('/pharmacists/:staffId/restore', isAdmin, staffController.restorePharmacist);

// Branch related routes
router.get('/branches', staffController.getAllBranches);

module.exports = router; 