const db = require('../config/database');
const { getConvertTZString, getMySQLTimestamp } = require('../utils/timeZoneUtil');

// Get all customers with pagination and search
const getCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;
        const searchPattern = `%${search}%`;

        // Get total count for pagination
        const [countResult] = await db.pool.query(
            `SELECT COUNT(*) as total 
             FROM customers 
             WHERE (name LIKE ? OR phone LIKE ? OR email LIKE ?) 
             AND is_archived = 0`,
            [searchPattern, searchPattern, searchPattern]
        );
        const total = countResult[0].total;

        // Get customers with converted timestamps
        const [customers] = await db.pool.query(
            `SELECT 
                customer_id, name, phone, email, address, 
                discount_type, discount_id_number,
                ${getConvertTZString('created_at')} as created_at,
                ${getConvertTZString('updated_at')} as updated_at
             FROM customers 
             WHERE (name LIKE ? OR phone LIKE ? OR email LIKE ?)
             AND is_archived = 0
             ORDER BY name ASC
             LIMIT ? OFFSET ?`,
            [searchPattern, searchPattern, searchPattern, Number(limit), offset]
        );

        // Get customer statistics
        const [statistics] = await db.pool.query(`
            SELECT 
                COUNT(*) as total_customers,
                COUNT(CASE WHEN discount_type = 'Senior' THEN 1 END) as senior_count,
                COUNT(CASE WHEN discount_type = 'PWD' THEN 1 END) as pwd_count,
                COUNT(CASE WHEN discount_type = 'Employee' THEN 1 END) as employee_count
            FROM customers
            WHERE is_archived = 0
        `);

        res.json({
            success: true,
            data: {
                customers,
                total,
                statistics: statistics[0]
            }
        });
    } catch (error) {
        console.error('Error getting customers:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting customers',
            error: error.message
        });
    }
};

// Search customers by name, phone, or email
const searchCustomers = async (req, res) => {
    try {
        const { query } = req.query;
        const searchPattern = `%${query}%`;

        // Get customer information with converted timestamps
        const [customers] = await db.pool.query(
            `SELECT 
                customer_id, name, phone, email, address, 
                discount_type, discount_id_number,
                ${getConvertTZString('created_at')} as created_at,
                ${getConvertTZString('updated_at')} as updated_at
             FROM customers 
             WHERE (name LIKE ? OR phone LIKE ? OR email LIKE ?)
             AND is_archived = 0
             LIMIT 1`,
            [searchPattern, searchPattern, searchPattern]
        );

        if (customers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No customer found'
            });
        }

        const customer = customers[0];

        // Get star points information
        const [starPoints] = await db.pool.query(
            'SELECT * FROM star_points WHERE customer_id = ?',
            [customer.customer_id]
        );

        // Get star points transactions with converted timestamps
        const [starPointsTransactions] = await db.pool.query(
            `SELECT 
                transaction_id, points_amount, transaction_type,
                reference_transaction_id,
                ${getConvertTZString('created_at')} as created_at
             FROM star_points_transactions 
             WHERE star_points_id = ?
             ORDER BY created_at DESC`,
            [starPoints[0]?.star_points_id]
        );

        // Get prescriptions with converted timestamps
        const [prescriptions] = await db.pool.query(
            `SELECT 
                p.prescription_id, p.doctor_name, p.doctor_license_number,
                DATE(${getConvertTZString('p.prescription_date')}) as prescription_date,
                DATE(${getConvertTZString('p.expiry_date')}) as expiry_date,
                p.notes, p.status,
                ${getConvertTZString('p.created_at')} as created_at,
                ${getConvertTZString('p.updated_at')} as updated_at
             FROM prescriptions p
             WHERE p.customer_id = ?
             ORDER BY p.prescription_date DESC`,
            [customer.customer_id]
        );

        // Get prescription items for each prescription
        const prescriptionsWithItems = await Promise.all(
            prescriptions.map(async (prescription) => {
                const [items] = await db.pool.query(
                    `SELECT 
                        pi.item_id, pi.product_id, p.name as product_name,
                        pi.prescribed_quantity, pi.dispensed_quantity,
                        pi.dosage_instructions
                     FROM prescription_items pi
                     JOIN products p ON pi.product_id = p.id
                     WHERE pi.prescription_id = ?`,
                    [prescription.prescription_id]
                );
                return { ...prescription, items };
            })
        );

        res.json({
            success: true,
            data: {
                customer,
                starPoints: starPoints[0] || null,
                starPointsTransactions,
                prescriptions: prescriptionsWithItems
            }
        });
    } catch (error) {
        console.error('Error searching customers:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching customers',
            error: error.message
        });
    }
};

// Create new customer
const createCustomer = async (req, res) => {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        const { name, phone, email, address, discount_type, discount_id_number, card_id, apply_star_points } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({ success: false, message: 'Customer name is required' });
        }

        // Check if card_id is already registered if provided
        if (card_id) {
            const [existingCard] = await connection.query(
                'SELECT customer_id FROM customers WHERE card_id = ?',
                [card_id]
            );
            if (existingCard.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'This card is already registered to another customer' 
                });
            }
        }

        // Insert customer with proper timestamp
        const [result] = await connection.query(
            `INSERT INTO customers (
                name, phone, email, address, 
                discount_type, discount_id_number, card_id, 
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ${getMySQLTimestamp()}, ${getMySQLTimestamp()})`,
            [name, phone, email, address, discount_type, discount_id_number, card_id]
        );

        const customerId = result.insertId;

        // Initialize star points if requested
        if (apply_star_points) {
            if (!card_id) {
                throw new Error('Card ID is required for Star Points registration');
            }

            // Insert into star_points with proper timestamp
            const [starPointsResult] = await connection.query(
                `INSERT INTO star_points (
                    customer_id, points_balance, total_points_earned, 
                    total_points_redeemed, created_at, updated_at
                ) VALUES (?, 0, 0, 0, ${getMySQLTimestamp()}, ${getMySQLTimestamp()})`,
                [customerId]
            );

            const starPointsId = starPointsResult.insertId;

            // Generate reference ID (YYYYMMDD##### format)
            const date = new Date();
            const dateStr = date.getFullYear() +
                String(date.getMonth() + 1).padStart(2, '0') +
                String(date.getDate()).padStart(2, '0');
            
            // Get the last sequence number for today
            const [lastRef] = await connection.query(
                "SELECT reference_transaction_id FROM star_points_transactions WHERE reference_transaction_id LIKE ? ORDER BY reference_transaction_id DESC LIMIT 1",
                [`${dateStr}%`]
            );
            
            let sequence = '00001';
            if (lastRef.length > 0) {
                const lastSeq = parseInt(lastRef[0].reference_transaction_id.slice(-5));
                sequence = String(lastSeq + 1).padStart(5, '0');
            }
            
            const referenceId = `${dateStr}${sequence}`;

            // Add initial transaction record with proper timestamp
            await connection.query(
                `INSERT INTO star_points_transactions (
                    star_points_id, points_amount, transaction_type, 
                    reference_transaction_id, created_at
                ) VALUES (?, 0, ?, ?, ${getMySQLTimestamp()})`,
                [starPointsId, 'EARNED', referenceId]
            );
        }

        await connection.commit();
        res.json({ 
            success: true, 
            message: 'Customer created successfully', 
            data: { 
                customer_id: customerId,
                star_points_enabled: apply_star_points 
            } 
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating customer:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to create customer' 
        });
    } finally {
        connection.release();
    }
};

// Get customer details with all related data
const getCustomerDetails = async (req, res) => {
    try {
        const { customer_id } = req.params;

        // Get customer basic info with converted timestamps
        const [customers] = await db.pool.query(
            `SELECT 
                customer_id, name, phone, email, address, 
                discount_type, discount_id_number, card_id,
                ${getConvertTZString('created_at')} as created_at,
                ${getConvertTZString('updated_at')} as updated_at
             FROM customers 
             WHERE customer_id = ? AND is_archived = 0`,
            [customer_id]
        );

        if (customers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const customer = customers[0];

        // Get star points information
        const [starPoints] = await db.pool.query(
            `SELECT 
                star_points_id,
                points_balance,
                total_points_earned,
                total_points_redeemed,
                ${getConvertTZString('created_at')} as created_at,
                ${getConvertTZString('updated_at')} as updated_at
             FROM star_points 
             WHERE customer_id = ?`,
            [customer_id]
        );

        // Get star points transactions with converted timestamps
        const [starPointsTransactions] = await db.pool.query(
            `SELECT 
                transaction_id,
                points_amount,
                transaction_type,
                reference_transaction_id,
                ${getConvertTZString('created_at')} as created_at
             FROM star_points_transactions 
             WHERE star_points_id = ?
             ORDER BY created_at DESC`,
            [starPoints[0]?.star_points_id]
        );

        // Get prescriptions with converted timestamps
        const [prescriptions] = await db.pool.query(
            `SELECT 
                p.prescription_id,
                p.doctor_name,
                p.doctor_license_number,
                DATE(${getConvertTZString('p.prescription_date')}) as prescription_date,
                DATE(${getConvertTZString('p.expiry_date')}) as expiry_date,
                p.notes,
                p.status,
                p.image_data,
                ${getConvertTZString('p.created_at')} as created_at,
                ${getConvertTZString('p.updated_at')} as updated_at
             FROM prescriptions p
             WHERE p.customer_id = ?
             ORDER BY p.prescription_date DESC`,
            [customer_id]
        );

        // Convert image_data to base64 for each prescription
        const prescriptionsWithItems = await Promise.all(
            prescriptions.map(async (prescription) => {
                const [items] = await db.pool.query(
                    `SELECT 
                        pi.item_id,
                        pi.product_id,
                        p.name as product_name,
                        pi.prescribed_quantity,
                        pi.dispensed_quantity,
                        pi.dosage_instructions
                     FROM prescription_items pi
                     JOIN products p ON pi.product_id = p.id
                     WHERE pi.prescription_id = ?`,
                    [prescription.prescription_id]
                );
                
                // Convert image_data to base64 if it exists
                const imageData = prescription.image_data 
                    ? `data:image/png;base64,${prescription.image_data.toString('base64')}`
                    : null;
                    
                return { 
                    ...prescription, 
                    items,
                    image_data: imageData
                };
            })
        );

        res.json({
            success: true,
            data: {
                customer,
                starPoints: starPoints[0] || null,
                starPointsTransactions,
                prescriptions: prescriptionsWithItems
            }
        });
    } catch (error) {
        console.error('Error getting customer details:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting customer details',
            error: error.message
        });
    }
};

// Update customer
const updateCustomer = async (req, res) => {
    try {
        const { customer_id } = req.params;
        const { 
            name, 
            phone, 
            email, 
            address, 
            discount_type, 
            discount_id_number 
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Customer name is required'
            });
        }

        // Check if customer exists
        const [existingCustomer] = await db.pool.query(
            'SELECT * FROM customers WHERE customer_id = ? AND is_archived = 0',
            [customer_id]
        );

        if (existingCustomer.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Validate discount ID if discount type is not None
        if (discount_type !== 'None' && !discount_id_number) {
            return res.status(400).json({
                success: false,
                message: 'Discount ID is required for the selected discount type'
            });
        }

        // Update customer with converted timestamp
        await db.pool.query(
            `UPDATE customers 
             SET name = ?, 
                 phone = ?, 
                 email = ?, 
                 address = ?, 
                 discount_type = ?, 
                 discount_id_number = ?,
                 updated_at = ${getMySQLTimestamp()}
             WHERE customer_id = ?`,
            [name, phone, email, address, discount_type, discount_id_number, customer_id]
        );

        // Get updated customer with converted timestamps
        const [updatedCustomer] = await db.pool.query(
            `SELECT 
                customer_id, name, phone, email, address, 
                discount_type, discount_id_number,
                ${getConvertTZString('created_at')} as created_at,
                ${getConvertTZString('updated_at')} as updated_at
             FROM customers 
             WHERE customer_id = ?`,
            [customer_id]
        );

        res.json({
            success: true,
            message: 'Customer updated successfully',
            data: {
                customer: updatedCustomer[0]
            }
        });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating customer',
            error: error.message
        });
    }
};

// Archive customer
const archiveCustomer = async (req, res) => {
    try {
        const { customer_id } = req.params;
        const { archive_reason, archived_by } = req.body;

        if (!archive_reason) {
            return res.status(400).json({
                success: false,
                message: 'Archive reason is required'
            });
        }

        await db.pool.query(
            `UPDATE customers 
             SET is_archived = 1,
                 archive_reason = ?,
                 archived_by = ?,
                 archived_at = NOW(),
                 updated_at = NOW()
             WHERE customer_id = ?`,
            [archive_reason, archived_by, customer_id]
        );

        res.json({
            success: true,
            message: 'Customer archived successfully'
        });
    } catch (error) {
        console.error('Error archiving customer:', error);
        res.status(500).json({
            success: false,
            message: 'Error archiving customer',
            error: error.message
        });
    }
};

// Bulk archive customers
const bulkArchiveCustomers = async (req, res) => {
    try {
        const { customer_ids, archive_reason, archived_by } = req.body;

        if (!archive_reason || !customer_ids || !customer_ids.length) {
            return res.status(400).json({
                success: false,
                message: 'Archive reason and customer IDs are required'
            });
        }

        await db.pool.query(
            `UPDATE customers 
             SET is_archived = 1,
                 archive_reason = ?,
                 archived_by = ?,
                 archived_at = NOW(),
                 updated_at = NOW()
             WHERE customer_id IN (?)`,
            [archive_reason, archived_by, customer_ids]
        );

        res.json({
            success: true,
            message: 'Customers archived successfully'
        });
    } catch (error) {
        console.error('Error bulk archiving customers:', error);
        res.status(500).json({
            success: false,
            message: 'Error bulk archiving customers',
            error: error.message
        });
    }
};

// Get archived customers
const getArchivedCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;
        const searchPattern = `%${search}%`;

        // Get total count for pagination
        const [countResult] = await db.pool.query(
            `SELECT COUNT(*) as total 
             FROM customers 
             WHERE (name LIKE ? OR phone LIKE ? OR email LIKE ?) 
             AND is_archived = 1`,
            [searchPattern, searchPattern, searchPattern]
        );
        const total = countResult[0].total;

        // Get archived customers with converted timestamps
        const [customers] = await db.pool.query(
            `SELECT 
                customer_id, name, phone, email, address, 
                discount_type, discount_id_number,
                ${getConvertTZString('archived_at')} as archived_at,
                archive_reason, archived_by,
                ${getConvertTZString('created_at')} as created_at,
                ${getConvertTZString('updated_at')} as updated_at
             FROM customers 
             WHERE (name LIKE ? OR phone LIKE ? OR email LIKE ?)
             AND is_archived = 1
             ORDER BY archived_at DESC
             LIMIT ? OFFSET ?`,
            [searchPattern, searchPattern, searchPattern, Number(limit), offset]
        );

        res.json({
            success: true,
            data: {
                customers,
                total
            }
        });
    } catch (error) {
        console.error('Error getting archived customers:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting archived customers',
            error: error.message
        });
    }
};

// Restore archived customer
const restoreCustomer = async (req, res) => {
    try {
        const { customer_id } = req.params;

        await db.pool.query(
            `UPDATE customers 
             SET is_archived = 0,
                 archive_reason = NULL,
                 archived_by = NULL,
                 archived_at = NULL,
                 updated_at = NOW()
             WHERE customer_id = ?`,
            [customer_id]
        );

        res.json({
            success: true,
            message: 'Customer restored successfully'
        });
    } catch (error) {
        console.error('Error restoring customer:', error);
        res.status(500).json({
            success: false,
            message: 'Error restoring customer',
            error: error.message
        });
    }
};

module.exports = {
    getCustomers,
    searchCustomers,
    createCustomer,
    updateCustomer,
    archiveCustomer,
    bulkArchiveCustomers,
    getArchivedCustomers,
    restoreCustomer,
    getCustomerDetails
}; 