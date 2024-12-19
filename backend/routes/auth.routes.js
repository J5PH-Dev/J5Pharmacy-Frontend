const express = require('express');
const router = express.Router();
const authController = require('../controller/auth.controller');
const { verifyToken, isPharmacist } = require('../middleware/auth.middleware');

// PMS Login route (Admin/Manager)
router.post('/pms/login', authController.pmsLogin);

// POS Login route (Pharmacist)
router.post('/pos/login', authController.posLogin);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-token', authController.verifyResetToken);
router.post('/reset-password', authController.resetPassword);

// End pharmacist session
router.post('/pos/end-session', verifyToken, isPharmacist, authController.endPharmacistSession);

module.exports = router; 