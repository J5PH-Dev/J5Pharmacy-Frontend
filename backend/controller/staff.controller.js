const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { getMySQLTimestamp, getCurrentTimestamp, getConvertTZString } = require('../utils/timeZoneUtil');
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
}).single('image');

// Get all users with their branch information
const getAllUsers = async (req, res) => {
    try {
        const { include_archived, role, branch_id } = req.query;
        let conditions = [];
        let params = [];

        // Base condition for archived status
        if (include_archived !== 'true') {
            conditions.push('u.is_active = 1');
        }

        // Add role filter if provided
        if (role) {
            conditions.push('u.role = ?');
            params.push(role);
        }

        // Add branch filter if provided
        if (branch_id) {
            conditions.push('u.branch_id = ?');
            params.push(branch_id);
        }

        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        const [users] = await db.pool.query(
            `SELECT u.user_id, u.employee_id, u.name, u.role, u.email, u.phone, 
             u.branch_id, u.remarks, u.is_active, b.branch_name,
             ${getConvertTZString('u.created_at')} as created_at,
             ${getConvertTZString('u.updated_at')} as updated_at,
             ${getConvertTZString('u.hired_at')} as hired_at,
             CASE WHEN u.image_data IS NOT NULL 
                  THEN CONCAT('data:', u.image_type, ';base64,', TO_BASE64(u.image_data))
                  ELSE NULL 
             END as image_url
             FROM users u
             LEFT JOIN branches b ON u.branch_id = b.branch_id
             ${whereClause}
             ORDER BY u.created_at DESC`,
            params
        );

        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
};

// Create new user
const createUser = async (req, res) => {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        const {
            employee_id,
            name,
            password,
            role,
            email,
            phone,
            branch_id,
            remarks,
            hired_at
        } = req.body;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await connection.query(
            `INSERT INTO users (
                employee_id, name, password, role, email, phone,
                branch_id, remarks, hired_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ${getMySQLTimestamp()}, ${getMySQLTimestamp()})`,
            [employee_id, name, hashedPassword, role, email, phone, branch_id, remarks, hired_at]
        );

        await connection.commit();
        res.json({
            success: true,
            message: 'User created successfully',
            userId: result.insertId
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: error.code === 'ER_DUP_ENTRY' ? 'Employee ID already exists' : 'Error creating user'
        });
    } finally {
        connection.release();
    }
};

// Update user
const updateUser = async (req, res) => {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        const { userId } = req.params;
        const {
            email,
            phone,
            remarks,
            current_password,
            new_password
        } = req.body;

        // Start building the update query
        let updateFields = [];
        let updateValues = [];

        // Add basic fields
        if (email) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        if (phone) {
            updateFields.push('phone = ?');
            updateValues.push(phone);
        }
        if (remarks) {
            updateFields.push('remarks = ?');
            updateValues.push(remarks);
        }

        // Handle password change if provided
        if (current_password && new_password) {
            // Verify current password
            const [users] = await connection.query(
                'SELECT password FROM users WHERE user_id = ?',
                [userId]
            );

            if (users.length === 0) {
                throw new Error('User not found');
            }

            const isValidPassword = await bcrypt.compare(current_password, users[0].password);
            if (!isValidPassword) {
                throw new Error('Current password is incorrect');
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(new_password, 10);
            updateFields.push('password = ?');
            updateValues.push(hashedPassword);
        }

        // Handle image upload if provided
        if (req.file) {
            updateFields.push('image_data = ?');
            updateValues.push(req.file.buffer);
            updateFields.push('image_type = ?');
            updateValues.push(req.file.mimetype);
        }

        // Add updated_at timestamp
        updateFields.push(`updated_at = ${getMySQLTimestamp()}`);

        // If there are fields to update
        if (updateFields.length > 0) {
            const query = `
                UPDATE users 
                SET ${updateFields.join(', ')}
                WHERE user_id = ?
            `;
            updateValues.push(userId);

            await connection.query(query, updateValues);
        }

        // Get updated user data
        const [updatedUser] = await connection.query(
            `SELECT 
                user_id, employee_id, name, role, email, phone,
                branch_id, remarks, is_active,
                CASE WHEN image_data IS NOT NULL 
                    THEN TO_BASE64(image_data)
                    ELSE NULL 
                END as image_data,
                image_type,
                ${getConvertTZString('created_at')} as created_at,
                ${getConvertTZString('updated_at')} as updated_at,
                ${getConvertTZString('hired_at')} as hired_at
            FROM users 
            WHERE user_id = ?`,
            [userId]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser[0]
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating user'
        });
    } finally {
        connection.release();
    }
};

// Archive user (soft delete)
const archiveUser = async (req, res) => {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        const { userId } = req.params;
        await connection.query(
            `UPDATE users 
             SET is_active = 0,
                 updated_at = ${getMySQLTimestamp()}
             WHERE user_id = ?`,
            [userId]
        );

        await connection.commit();
        res.json({
            success: true,
            message: 'User archived successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error archiving user:', error);
        res.status(500).json({ success: false, message: 'Error archiving user' });
    } finally {
        connection.release();
    }
};

// Get all pharmacists
const getAllPharmacists = async (req, res) => {
    try {
        const { include_archived, branch_id } = req.query;
        let conditions = [];
        let params = [];

        // Base condition for archived status
        if (include_archived !== 'true') {
            conditions.push('p.is_active = 1');
        }

        // Add branch filter if provided
        if (branch_id) {
            conditions.push('p.branch_id = ?');
            params.push(branch_id);
        }

        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        const [pharmacists] = await db.pool.query(
            `SELECT p.staff_id, p.name, p.email, p.phone, p.pin_code, 
             p.branch_id, p.is_active, b.branch_name,
             p.created_at as created_at,
             p.updated_at as updated_at,
             CASE WHEN p.image_data IS NOT NULL 
                  THEN CONCAT('data:', p.image_type, ';base64,', TO_BASE64(p.image_data))
                  ELSE NULL 
             END as image_url
             FROM pharmacist p
             LEFT JOIN branches b ON p.branch_id = b.branch_id
             ${whereClause}
             ORDER BY p.created_at DESC`,
            params
        );

        res.json({ success: true, data: pharmacists });
    } catch (error) {
        console.error('Error fetching pharmacists:', error);
        res.status(500).json({ success: false, message: 'Error fetching pharmacists' });
    }
};

// Create new pharmacist
const createPharmacist = async (req, res) => {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        const {
            name,
            email,
            phone,
            pin_code,
            branch_id
        } = req.body;

        const [result] = await connection.query(
            `INSERT INTO pharmacist (
                name, email, phone, pin_code, branch_id,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ${getMySQLTimestamp()}, ${getMySQLTimestamp()})`,
            [name, email, phone, pin_code, branch_id]
        );

        await connection.commit();
        res.json({
            success: true,
            message: 'Pharmacist created successfully',
            staffId: result.insertId
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating pharmacist:', error);
        res.status(500).json({
            success: false,
            message: error.code === 'ER_DUP_ENTRY' ? 'PIN code already exists' : 'Error creating pharmacist'
        });
    } finally {
        connection.release();
    }
};

// Update pharmacist
const updatePharmacist = async (req, res) => {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        const { staffId } = req.params;
        const {
            name,
            email,
            phone,
            pin_code,
            branch_id
        } = req.body;

        await connection.query(
            `UPDATE pharmacist 
             SET name = ?, email = ?, phone = ?,
                 pin_code = ?, branch_id = ?,
                 updated_at = ${getMySQLTimestamp()}
             WHERE staff_id = ?`,
            [name, email, phone, pin_code, branch_id, staffId]
        );

        await connection.commit();
        res.json({
            success: true,
            message: 'Pharmacist updated successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating pharmacist:', error);
        res.status(500).json({
            success: false,
            message: error.code === 'ER_DUP_ENTRY' ? 'PIN code already exists' : 'Error updating pharmacist'
        });
    } finally {
        connection.release();
    }
};

// Archive pharmacist (soft delete)
const archivePharmacist = async (req, res) => {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        const { staffId } = req.params;
        await connection.query(
            `UPDATE pharmacist 
             SET is_active = 0,
                 updated_at = ${getMySQLTimestamp()}
             WHERE staff_id = ?`,
            [staffId]
        );

        await connection.commit();
        res.json({
            success: true,
            message: 'Pharmacist archived successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error archiving pharmacist:', error);
        res.status(500).json({ success: false, message: 'Error archiving pharmacist' });
    } finally {
        connection.release();
    }
};

// Get all branches
const getAllBranches = async (req, res) => {
    try {
        const [branches] = await db.pool.query(
            `SELECT * FROM branches 
             WHERE is_active = 1 AND is_archived = 0
             ORDER BY branch_name ASC`
        );

        res.json({ success: true, data: branches });
    } catch (error) {
        console.error('Error fetching branches:', error);
        res.status(500).json({ success: false, message: 'Error fetching branches' });
    }
};

// Upload user image
const uploadUserImage = async (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: 'File upload error' });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        const { userId } = req.params;
        const imageBuffer = req.file ? req.file.buffer : null;
        const imageType = req.file ? req.file.mimetype : null;

        if (!imageBuffer) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }

        const connection = await db.pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query(
                `UPDATE users 
                 SET image_data = ?,
                     image_type = ?,
                     updated_at = ${getMySQLTimestamp()}
                 WHERE user_id = ?`,
                [imageBuffer, imageType, userId]
            );

            await connection.commit();
            res.json({
                success: true,
                message: 'Image uploaded successfully',
                image_url: `data:${imageType};base64,${imageBuffer.toString('base64')}`
            });
        } catch (error) {
            await connection.rollback();
            console.error('Error uploading image:', error);
            res.status(500).json({ success: false, message: 'Error uploading image' });
        } finally {
            connection.release();
        }
    });
};

// Upload pharmacist image
const uploadPharmacistImage = async (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: 'File upload error' });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        const { staffId } = req.params;
        const imageBuffer = req.file ? req.file.buffer : null;
        const imageType = req.file ? req.file.mimetype : null;

        if (!imageBuffer) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }

        const connection = await db.pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query(
                `UPDATE pharmacist 
                 SET image_data = ?,
                     image_type = ?,
                     updated_at = ${getMySQLTimestamp()}
                 WHERE staff_id = ?`,
                [imageBuffer, imageType, staffId]
            );

            await connection.commit();
            res.json({
                success: true,
                message: 'Image uploaded successfully',
                image_url: `data:${imageType};base64,${imageBuffer.toString('base64')}`
            });
        } catch (error) {
            await connection.rollback();
            console.error('Error uploading image:', error);
            res.status(500).json({ success: false, message: 'Error uploading image' });
        } finally {
            connection.release();
        }
    });
};

// Restore user
const restoreUser = async (req, res) => {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        const { userId } = req.params;
        await connection.query(
            `UPDATE users 
             SET is_active = 1,
                 updated_at = ${getMySQLTimestamp()}
             WHERE user_id = ?`,
            [userId]
        );

        await connection.commit();
        res.json({
            success: true,
            message: 'User restored successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error restoring user:', error);
        res.status(500).json({ success: false, message: 'Error restoring user' });
    } finally {
        connection.release();
    }
};

// Restore pharmacist
const restorePharmacist = async (req, res) => {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        const { staffId } = req.params;
        await connection.query(
            `UPDATE pharmacist 
             SET is_active = 1,
                 updated_at = ${getMySQLTimestamp()}
             WHERE staff_id = ?`,
            [staffId]
        );

        await connection.commit();
        res.json({
            success: true,
            message: 'Pharmacist restored successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error restoring pharmacist:', error);
        res.status(500).json({ success: false, message: 'Error restoring pharmacist' });
    } finally {
        connection.release();
    }
};

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    archiveUser,
    restoreUser,
    getAllPharmacists,
    createPharmacist,
    updatePharmacist,
    archivePharmacist,
    restorePharmacist,
    getAllBranches,
    uploadUserImage,
    uploadPharmacistImage
}; 