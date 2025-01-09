const express = require('express');
const router = express.Router();
const multer = require('multer');
const prescriptionController = require('../controller/prescription.controller');

// Configure multer for handling file uploads
const storage = multer.memoryStorage(); // Store file in memory as Buffer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Create new prescription with image
router.post('/', upload.single('image'), prescriptionController.createPrescription);

// Update prescription image
router.put('/:prescription_id/image', upload.single('image'), prescriptionController.updatePrescriptionImage);

// Get prescription image
router.get('/:prescription_id/image', prescriptionController.getPrescriptionImage);

module.exports = router; 