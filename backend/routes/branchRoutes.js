const express = require('express');
const router = express.Router();
const branchController = require('../controller/branchController');
const { verifyToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(verifyToken);

// Get all branches
router.get('/branches', branchController.getAllBranches);

// Get archived branches
router.get('/archived-branches', branchController.getArchivedBranches);

// Get branch managers
router.get('/branch-managers', branchController.getBranchManagers);

// Generate branch code
router.get('/generate-branch-code', branchController.generateBranchCode);

// Add new branch
router.post('/add-branch', branchController.addBranch);

// Update branch
router.post('/update-branch', branchController.updateBranch);

// Archive branch
router.post('/archive-branch/:branch_id', branchController.archiveBranch);

// Restore archived branch
router.post('/restore-branch/:archive_id', branchController.restoreArchivedBranch);

// Add bulk operations routes
router.post('/bulk-archive-branches', branchController.bulkArchiveBranches);
router.post('/bulk-restore-branches', branchController.bulkRestoreArchivedBranches);

// Export routes
router.get('/export-branches', branchController.exportBranches);
router.get('/export-archived-branches', branchController.exportArchivedBranches);

module.exports = router;