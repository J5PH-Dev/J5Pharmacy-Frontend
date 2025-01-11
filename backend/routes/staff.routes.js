const express = require('express');
const router = express.Router();
const staffController = require('../controller/staff.controller');
const { verifyToken, isPMSUser } = require('../middleware/auth.middleware');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Only image files are allowed!'));
        }
        cb(null, true);
    }
});

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(isPMSUser);

// User routes
router.get('/users', staffController.getAllUsers);
router.post('/users', staffController.createUser);
router.put('/users/:userId', staffController.updateUser);
router.put('/users/:userId/archive', staffController.archiveUser);
router.put('/users/:userId/restore', staffController.restoreUser);
router.post('/users/upload-image/:userId', upload.single('image'), staffController.uploadUserImage);
router.put('/users/:userId/remove-image', staffController.removeUserImage);

// Pharmacist routes
router.get('/pharmacists', staffController.getAllPharmacists);
router.post('/pharmacists', staffController.createPharmacist);
router.put('/pharmacists/:staffId', staffController.updatePharmacist);
router.put('/pharmacists/:staffId/archive', staffController.archivePharmacist);
router.put('/pharmacists/:staffId/restore', staffController.restorePharmacist);
router.post('/pharmacists/upload-image/:staffId', upload.single('image'), staffController.uploadPharmacistImage);
router.put('/pharmacists/:staffId/remove-image', staffController.removePharmacistImage);

// Branch routes
router.get('/branches', staffController.getAllBranches);

module.exports = router; 