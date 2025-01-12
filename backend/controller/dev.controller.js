const db = require('../config/database');
const { getCurrentTimestamp, getMySQLTimestamp } = require('../utils/timeZoneUtil');

const devController = {
    // Get all active branches for dev tools
    getBranches: async (req, res) => {
        try {
            const [branches] = await db.pool.query(
                `SELECT branch_id, branch_name, is_active 
                FROM branches 
                WHERE is_active = TRUE AND is_archived = FALSE 
                ORDER BY branch_name ASC`
            );
            
            console.log('[DEV] Fetched branches for dev tools');
            res.json(branches);
        } catch (error) {
            console.error('Error fetching branches for dev tools:', error);
            res.status(500).json({ message: 'Failed to fetch branches' });
        }
    },

    // Generate test transaction
    generateTransaction: async (req, res) => {
        const connection = await db.pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const { total_amount, payment_method, branch_name } = req.body;

            // Generate a unique invoice number (YYMMDDHHmmss format)
            const timestamp = new Date();
            const invoiceNumber = `INV${timestamp.getFullYear().toString().slice(-2)}${
                String(timestamp.getMonth() + 1).padStart(2, '0')}${
                String(timestamp.getDate()).padStart(2, '0')}${
                String(timestamp.getHours()).padStart(2, '0')}${
                String(timestamp.getMinutes()).padStart(2, '0')}${
                String(timestamp.getSeconds()).padStart(2, '0')}`;

            // Get branch ID from branch name
            const [branchResult] = await connection.query(
                'SELECT branch_id FROM branches WHERE branch_name = ? AND is_active = TRUE',
                [branch_name]
            );

            if (branchResult.length === 0) {
                throw new Error('Branch not found or inactive');
            }

            const branchId = branchResult[0].branch_id;

            // Get the current daily sequence for the branch
            const [sequenceResult] = await connection.query(
                'SELECT COALESCE(MAX(daily_sequence), 0) + 1 as next_sequence FROM sales WHERE branch_id = ? AND DATE(created_at) = CURDATE()',
                [branchId]
            );
            const dailySequence = sequenceResult[0].next_sequence;

            // Insert sale with only required fields
            const [result] = await connection.query(
                `INSERT INTO sales (
                    invoice_number,
                    total_amount,
                    payment_method,
                    payment_status,
                    branch_id,
                    daily_sequence,
                    created_at,
                    updated_at
                ) VALUES (
                    ?, ?, ?, 'paid', ?, ?,
                    ${getMySQLTimestamp()}, ${getMySQLTimestamp()}
                )`,
                [invoiceNumber, total_amount, payment_method, branchId, dailySequence]
            );

            await connection.commit();

            console.log(`[DEV] Generated test sale: ${invoiceNumber} for ${branch_name} - Amount: ${total_amount} via ${payment_method}`);

            res.status(201).json({
                message: 'Test sale generated successfully',
                sale_id: result.insertId,
                invoice_number: invoiceNumber
            });

        } catch (error) {
            await connection.rollback();
            console.error('Error generating test sale:', error);
            res.status(500).json({ message: 'Failed to generate test sale' });
        } finally {
            connection.release();
        }
    }
};

module.exports = devController; 