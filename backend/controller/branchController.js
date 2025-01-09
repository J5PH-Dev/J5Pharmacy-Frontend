const db = require('../config/database');
const { getCurrentTimestamp, formatToLocalTime, getMySQLTimestamp } = require('../utils/timeZoneUtil');

const branchController = {
    // Get all branches with manager details
    getAllBranches: async (req, res) => {
        try {
            const query = `
                SELECT b.*, u.name as manager_name, u.email, u.phone as contact_number
                FROM branches b
                LEFT JOIN users u ON b.branch_manager = u.user_id
                WHERE b.is_archived = FALSE
                ORDER BY b.branch_name ASC
            `;
            const [branches] = await db.pool.query(query);
            
            // Format dates to local timezone
            const formattedBranches = branches.map(branch => ({
                ...branch,
                created_at: formatToLocalTime(branch.created_at),
                updated_at: formatToLocalTime(branch.updated_at),
                date_opened: formatToLocalTime(branch.date_opened)
            }));

            res.json(formattedBranches);
        } catch (error) {
            console.error('Error fetching branches:', error);
            res.status(500).json({ message: 'Failed to fetch branches' });
        }
    },

    // Get archived branches
    getArchivedBranches: async (req, res) => {
        try {
            const query = `
                SELECT b.*, u1.name as manager_name, u1.email as manager_email, u1.phone as manager_phone,
                       u2.name as archived_by_name, ba.archive_reason, ba.archived_at, ba.archive_id
                FROM branches b
                LEFT JOIN users u1 ON b.branch_manager = u1.user_id
                LEFT JOIN branches_archive ba ON b.branch_id = ba.branch_id
                LEFT JOIN users u2 ON ba.archived_by = u2.user_id
                WHERE b.is_archived = TRUE
                ORDER BY ba.archived_at DESC
            `;
            const [archives] = await db.pool.query(query);
            
            const formattedArchives = archives.map(archive => ({
                ...archive,
                archived_at: formatToLocalTime(archive.archived_at),
                date_opened: formatToLocalTime(archive.date_opened)
            }));

            res.json(formattedArchives);
        } catch (error) {
            console.error('Error fetching archived branches:', error);
            res.status(500).json({ message: 'Failed to fetch archived branches' });
        }
    },

    // Generate next branch code
    generateBranchCode: async (req, res) => {
        const connection = await db.pool.getConnection();
        try {
            await connection.beginTransaction();

            // Get and increment counter
            const [counter] = await connection.query(
                'SELECT counter FROM branch_code_counter WHERE id = 1 FOR UPDATE'
            );
            
            const nextNumber = (counter[0]?.counter || 0) + 1;
            
            // Format branch code
            const branch_code = `J5P-B${String(nextNumber).padStart(3, '0')}`;

            await connection.commit();
            res.json({ branch_code });
        } catch (error) {
            await connection.rollback();
            console.error('Error generating branch code:', error);
            res.status(500).json({ message: 'Failed to generate branch code' });
        } finally {
            connection.release();
        }
    },

    // Add new branch
    addBranch: async (req, res) => {
        const connection = await db.pool.getConnection();
        try {
            await connection.beginTransaction();

            const { branch_code, branch_name, address, city, date_opened, branch_manager, is_active } = req.body;

            // Validate required fields
            if (!branch_code || !branch_name || !address || !city || !date_opened) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            // Check if branch code already exists
            const [existingBranch] = await connection.query(
                'SELECT * FROM branches WHERE branch_code = ?',
                [branch_code]
            );

            if (existingBranch.length > 0) {
                return res.status(400).json({ message: 'Branch code already exists' });
            }

            // Update counter
            await connection.query(
                'UPDATE branch_code_counter SET counter = counter + 1 WHERE id = 1'
            );

            const query = `
                INSERT INTO branches (
                    branch_code, branch_name, address, city, 
                    date_opened, branch_manager, is_active, 
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ${getMySQLTimestamp()}, ${getMySQLTimestamp()})
            `;

            const [result] = await connection.query(query, [
                branch_code,
                branch_name,
                address,
                city,
                date_opened,
                branch_manager,
                is_active ? 1 : 0
            ]);

            await connection.commit();
            res.status(201).json({ 
                message: 'Branch added successfully',
                branch_id: result.insertId,
                branch_code
            });
        } catch (error) {
            await connection.rollback();
            console.error('Error adding branch:', error);
            res.status(500).json({ message: 'Failed to add branch' });
        } finally {
            connection.release();
        }
    },

    // Update branch
    updateBranch: async (req, res) => {
        try {
            const { branch_id, branch_code, branch_name, address, city, date_opened, branch_manager, is_active } = req.body;

            // Validate required fields
            if (!branch_id || !branch_code || !branch_name || !address || !city || !date_opened) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            // Check if branch exists
            const [existingBranch] = await db.pool.query(
                'SELECT * FROM branches WHERE branch_id = ? AND is_archived = FALSE', 
                [branch_id]
            );
            if (existingBranch.length === 0) {
                return res.status(404).json({ message: 'Branch not found' });
            }

            // Check if branch code is unique (excluding current branch)
            const [duplicateBranch] = await db.pool.query(
                'SELECT * FROM branches WHERE branch_code = ? AND branch_id != ?',
                [branch_code, branch_id]
            );
            if (duplicateBranch.length > 0) {
                return res.status(400).json({ message: 'Branch code already exists' });
            }

            const query = `
                UPDATE branches 
                SET branch_code = ?, 
                    branch_name = ?, 
                    address = ?, 
                    city = ?, 
                    date_opened = ?, 
                    branch_manager = ?,
                    is_active = ?,
                    updated_at = ${getMySQLTimestamp()}
                WHERE branch_id = ? AND is_archived = FALSE
            `;

            await db.pool.query(query, [
                branch_code,
                branch_name,
                address,
                city,
                date_opened,
                branch_manager,
                is_active ? 1 : 0,
                branch_id
            ]);

            res.json({ message: 'Branch updated successfully' });
        } catch (error) {
            console.error('Error updating branch:', error);
            res.status(500).json({ message: 'Failed to update branch' });
        }
    },

    // Archive branch
    archiveBranch: async (req, res) => {
        const connection = await db.pool.getConnection();
        try {
            await connection.beginTransaction();

            const { branch_id } = req.params;
            const { archived_by, archive_reason } = req.body;

            // Check if branch exists and get its details
            const [branch] = await connection.query(
                'SELECT * FROM branches WHERE branch_id = ? AND is_archived = FALSE',
                [branch_id]
            );

            if (branch.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Branch not found' });
            }

            // Check if branch has active users
            const [activeUsers] = await connection.query(
                'SELECT * FROM users WHERE branch_id = ? AND is_active = 1',
                [branch_id]
            );

            if (activeUsers.length > 0) {
                await connection.rollback();
                return res.status(400).json({ 
                    message: 'Cannot archive branch with active users',
                    activeUsers: activeUsers.map(user => ({ 
                        name: user.name,
                        role: user.role
                    }))
                });
            }

            // Insert into archive table with all branch details
            await connection.query(
                `INSERT INTO branches_archive (
                    branch_id, branch_code, branch_name, address, city,
                    date_opened, branch_manager, archived_by, archive_reason,
                    archived_at, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
                [
                    branch[0].branch_id,
                    branch[0].branch_code,
                    branch[0].branch_name,
                    branch[0].address,
                    branch[0].city,
                    branch[0].date_opened,
                    branch[0].branch_manager,
                    archived_by,
                    archive_reason,
                    branch[0].is_active
                ]
            );

            // Update branch status
            await connection.query(
                'UPDATE branches SET is_archived = TRUE, updated_at = NOW() WHERE branch_id = ?',
                [branch_id]
            );

            await connection.commit();
            res.json({ message: 'Branch archived successfully' });
        } catch (error) {
            await connection.rollback();
            console.error('Error archiving branch:', error);
            res.status(500).json({ message: 'Failed to archive branch' });
        } finally {
            connection.release();
        }
    },

    // Restore archived branch
    restoreArchivedBranch: async (req, res) => {
        const connection = await db.pool.getConnection();
        try {
            await connection.beginTransaction();

            const { archive_id } = req.params;

            // Get archive details
            const [archive] = await connection.query(
                'SELECT ba.*, b.is_active FROM branches_archive ba JOIN branches b ON ba.branch_id = b.branch_id WHERE ba.archive_id = ?',
                [archive_id]
            );

            if (archive.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Archive not found' });
            }

            // Restore the branch (keep is_active status)
            await connection.query(
                'UPDATE branches SET is_archived = FALSE, updated_at = ? WHERE branch_id = ?',
                [getCurrentTimestamp(), archive[0].branch_id]
            );

            // Delete from archive
            await connection.query(
                'DELETE FROM branches_archive WHERE archive_id = ?',
                [archive_id]
            );

            await connection.commit();
            res.json({ message: 'Branch restored successfully' });
        } catch (error) {
            await connection.rollback();
            console.error('Error restoring branch:', error);
            res.status(500).json({ message: 'Failed to restore branch' });
        } finally {
            connection.release();
        }
    },

    // Get branch managers (active users with MANAGER role)
    getBranchManagers: async (req, res) => {
        try {
            const query = `
                SELECT user_id, name, email, phone
                FROM users
                WHERE role = 'MANAGER' AND is_active = 1
                ORDER BY name ASC
            `;
            const [managers] = await db.pool.query(query);
            res.json(managers);
        } catch (error) {
            console.error('Error fetching branch managers:', error);
            res.status(500).json({ message: 'Failed to fetch branch managers' });
        }
    },

    // Add bulk archive function
    bulkArchiveBranches: async (req, res) => {
        const { branch_ids, archived_by, archive_reason } = req.body;
        const connection = await db.pool.getConnection();

        try {
            await connection.beginTransaction();

            // Get branch details before archiving
            const [branches] = await connection.query(
                'SELECT * FROM branches WHERE branch_id IN (?) AND is_archived = FALSE',
                [branch_ids]
            );

            if (branches.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'No branches found' });
            }

            // Check for active users in any of the branches
            const [activeUsers] = await connection.query(
                'SELECT branch_id, COUNT(*) as user_count FROM users WHERE branch_id IN (?) AND is_active = 1 GROUP BY branch_id',
                [branch_ids]
            );

            if (activeUsers.length > 0) {
                await connection.rollback();
                return res.status(400).json({
                    message: 'Cannot archive branches with active users',
                    branches_with_users: activeUsers
                });
            }

            // Insert into branches_archive
            const archiveValues = branches.map(branch => [
                branch.branch_id,
                branch.branch_code,
                branch.branch_name,
                branch.address,
                branch.city,
                branch.date_opened,
                branch.branch_manager,
                archived_by,
                archive_reason,
                new Date(), // archived_at
                branch.is_active
            ]);

            await connection.query(
                `INSERT INTO branches_archive (
                    branch_id, branch_code, branch_name, address, city,
                    date_opened, branch_manager, archived_by, archive_reason,
                    archived_at, is_active
                ) VALUES ?`,
                [archiveValues]
            );

            // Update branches table
            await connection.query(
                'UPDATE branches SET is_archived = TRUE, updated_at = NOW() WHERE branch_id IN (?)',
                [branch_ids]
            );

            await connection.commit();
            res.json({ 
                message: 'Branches archived successfully',
                archivedCount: branches.length
            });
        } catch (error) {
            await connection.rollback();
            console.error('Error archiving branches:', error);
            res.status(500).json({ message: 'Failed to archive branches' });
        } finally {
            connection.release();
        }
    },

    // Add bulk restore function
    bulkRestoreArchivedBranches: async (req, res) => {
        const { archive_ids } = req.body;
        const connection = await db.pool.getConnection();

        try {
            await connection.beginTransaction();

            // Get archived branch details
            const [archivedBranches] = await connection.query(
                'SELECT * FROM branches_archive WHERE archive_id IN (?)',
                [archive_ids]
            );

            if (archivedBranches.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'No archived branches found' });
            }

            // Update branches table
            const branchIds = archivedBranches.map(branch => branch.branch_id);
            await connection.query(
                'UPDATE branches SET is_archived = FALSE WHERE branch_id IN (?)',
                [branchIds]
            );

            // Delete from branches_archive
            await connection.query(
                'DELETE FROM branches_archive WHERE archive_id IN (?)',
                [archive_ids]
            );

            await connection.commit();
            res.json({ 
                message: 'Branches restored successfully',
                restoredCount: archivedBranches.length
            });
        } catch (error) {
            await connection.rollback();
            console.error('Error restoring branches:', error);
            res.status(500).json({ message: 'Failed to restore branches' });
        } finally {
            connection.release();
        }
    },

    // Export branches
    exportBranches: async (req, res) => {
        try {
            const query = `
                SELECT 
                    b.branch_code as 'Branch Code',
                    b.branch_name as 'Branch Name',
                    b.address as 'Address',
                    b.city as 'City',
                    DATE_FORMAT(b.date_opened, '%M %d, %Y') as 'Date Opened',
                    COALESCE(u.name, 'Not Assigned') as 'Branch Manager',
                    COALESCE(u.email, 'N/A') as 'Manager Email',
                    COALESCE(u.phone, 'N/A') as 'Manager Contact',
                    IF(b.is_active, 'Active', 'Inactive') as 'Status',
                    DATE_FORMAT(b.created_at, '%M %d, %Y %h:%i %p') as 'Created At',
                    DATE_FORMAT(b.updated_at, '%M %d, %Y %h:%i %p') as 'Updated At'
                FROM branches b
                LEFT JOIN users u ON b.branch_manager = u.user_id
                WHERE b.is_archived = FALSE
                ORDER BY b.branch_name ASC
            `;

            const [branches] = await db.pool.query(query);

            // Set response headers for CSV
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=branches.csv');

            // Write CSV header
            if (branches.length > 0) {
                const headers = Object.keys(branches[0]);
                res.write(headers.join(',') + '\n');
            }

            // Write data rows
            branches.forEach(branch => {
                const values = Object.values(branch).map(value => {
                    // Handle values that might contain commas or quotes
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                });
                res.write(values.join(',') + '\n');
            });

            res.end();
        } catch (error) {
            console.error('Error exporting branches:', error);
            res.status(500).json({ message: 'Failed to export branches' });
        }
    },

    // Export archived branches
    exportArchivedBranches: async (req, res) => {
        try {
            const query = `
                SELECT 
                    b.branch_code as 'Branch Code',
                    b.branch_name as 'Branch Name',
                    b.address as 'Address',
                    b.city as 'City',
                    DATE_FORMAT(b.date_opened, '%M %d, %Y') as 'Date Opened',
                    COALESCE(u1.name, 'Not Assigned') as 'Branch Manager',
                    COALESCE(u1.email, 'N/A') as 'Manager Email',
                    COALESCE(u1.phone, 'N/A') as 'Manager Contact',
                    IF(b.is_active, 'Active', 'Inactive') as 'Status',
                    u2.name as 'Archived By',
                    ba.archive_reason as 'Archive Reason',
                    DATE_FORMAT(ba.archived_at, '%M %d, %Y %h:%i %p') as 'Archived At'
                FROM branches b
                LEFT JOIN users u1 ON b.branch_manager = u1.user_id
                LEFT JOIN branches_archive ba ON b.branch_id = ba.branch_id
                LEFT JOIN users u2 ON ba.archived_by = u2.user_id
                WHERE b.is_archived = TRUE
                ORDER BY ba.archived_at DESC
            `;

            const [archives] = await db.pool.query(query);

            // Set response headers for CSV
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=archived_branches.csv');

            // Write CSV header
            if (archives.length > 0) {
                const headers = Object.keys(archives[0]);
                res.write(headers.join(',') + '\n');
            }

            // Write data rows
            archives.forEach(archive => {
                const values = Object.values(archive).map(value => {
                    // Handle values that might contain commas or quotes
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                });
                res.write(values.join(',') + '\n');
            });

            res.end();
        } catch (error) {
            console.error('Error exporting archived branches:', error);
            res.status(500).json({ message: 'Failed to export archived branches' });
        }
    }
};

module.exports = branchController; 