const db = require('../config/database');
const { getMySQLTimestamp } = require('../utils/timeZoneUtil');

// Create a new transaction
const createTransaction = async (req, res) => {
    const connection = await db.pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const {
            items,
            customer_id,
            customer_name,
            total_amount,
            discount_amount,
            discount_type,
            discount_id_number,
            payment_method,
            branch_id,
            pharmacist_session_id
        } = req.body;

        // Insert into sales table
        const [saleResult] = await connection.query(
            `INSERT INTO sales (
                customer_id,
                customer_name,
                total_amount,
                discount_amount,
                discount_type,
                discount_id_number,
                payment_method,
                payment_status,
                branch_id,
                pharmacist_session_id,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'paid', ?, ?, ${getMySQLTimestamp()})`,
            [
                customer_id,
                customer_name,
                total_amount,
                discount_amount,
                discount_type,
                discount_id_number,
                payment_method,
                branch_id,
                pharmacist_session_id
            ]
        );

        const sale_id = saleResult.insertId;

        // Insert sale items
        for (const item of items) {
            await connection.query(
                `INSERT INTO sale_items (
                    sale_id,
                    product_id,
                    quantity,
                    unit_price,
                    total_price,
                    SKU,
                    prescription_id,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ${getMySQLTimestamp()})`,
                [
                    sale_id,
                    item.id,
                    item.quantity,
                    item.price,
                    item.price * item.quantity,
                    item.SKU || 'Piece',
                    item.prescription_id || null
                ]
            );

            // Update product stock
            await connection.query(
                `UPDATE products 
                 SET stock = stock - ?,
                     updatedAt = ${getMySQLTimestamp()}
                 WHERE id = ?`,
                [item.quantity, item.id]
            );
        }

        // Handle star points if customer exists
        if (customer_id) {
            const points_earned = Math.floor(total_amount / 100); // 1 point per 100 pesos

            // Get or create star points record
            const [starPointsResult] = await connection.query(
                `SELECT * FROM star_points WHERE customer_id = ?`,
                [customer_id]
            );

            let star_points_id;
            if (starPointsResult.length === 0) {
                const [newStarPoints] = await connection.query(
                    `INSERT INTO star_points (
                        customer_id,
                        points_balance,
                        total_points_earned,
                        created_at,
                        updated_at
                    ) VALUES (?, ?, ?, ${getMySQLTimestamp()}, ${getMySQLTimestamp()})`,
                    [customer_id, points_earned, points_earned]
                );
                star_points_id = newStarPoints.insertId;
            } else {
                star_points_id = starPointsResult[0].star_points_id;
                await connection.query(
                    `UPDATE star_points 
                     SET points_balance = points_balance + ?,
                         total_points_earned = total_points_earned + ?,
                         updated_at = ${getMySQLTimestamp()}
                     WHERE star_points_id = ?`,
                    [points_earned, points_earned, star_points_id]
                );
            }

            // Record star points transaction
            await connection.query(
                `INSERT INTO star_points_transactions (
                    star_points_id,
                    points_amount,
                    transaction_type,
                    reference_transaction_id,
                    created_at
                ) VALUES (?, ?, 'EARNED', ?, ${getMySQLTimestamp()})`,
                [star_points_id, points_earned, sale_id]
            );

            // Update sale with points earned
            await connection.query(
                `UPDATE sales 
                 SET points_earned = ?
                 WHERE id = ?`,
                [points_earned, sale_id]
            );
        }

        await connection.commit();

        // Get the generated invoice number
        const [saleData] = await connection.query(
            'SELECT invoice_number FROM sales WHERE id = ?',
            [sale_id]
        );

        res.json({
            success: true,
            message: 'Transaction created successfully',
            data: {
                sale_id,
                invoice_number: saleData[0].invoice_number
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create transaction',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Get transaction summary for a date range
const getTransactionSummary = async (req, res) => {
    try {
        const { start_date, end_date, branch_id } = req.query;
        
        const [summary] = await db.pool.query(
            `SELECT 
                COUNT(*) as total_transactions,
                SUM(total_amount) as total_sales,
                SUM(discount_amount) as total_discounts,
                COUNT(DISTINCT customer_id) as unique_customers,
                SUM(points_earned) as total_points_awarded
             FROM sales
             WHERE branch_id = ?
             AND DATE(created_at) BETWEEN DATE(?) AND DATE(?)
             AND payment_status = 'paid'`,
            [branch_id, start_date, end_date]
        );

        const [paymentMethods] = await db.pool.query(
            `SELECT 
                payment_method,
                COUNT(*) as count,
                SUM(total_amount) as total
             FROM sales
             WHERE branch_id = ?
             AND DATE(created_at) BETWEEN DATE(?) AND DATE(?)
             AND payment_status = 'paid'
             GROUP BY payment_method`,
            [branch_id, start_date, end_date]
        );

        const [discountTypes] = await db.pool.query(
            `SELECT 
                discount_type,
                COUNT(*) as count,
                SUM(discount_amount) as total
             FROM sales
             WHERE branch_id = ?
             AND DATE(created_at) BETWEEN DATE(?) AND DATE(?)
             AND payment_status = 'paid'
             AND discount_type != 'None'
             GROUP BY discount_type`,
            [branch_id, start_date, end_date]
        );

        res.json({
            success: true,
            data: {
                summary: summary[0],
                payment_methods: paymentMethods,
                discount_types: discountTypes
            }
        });

    } catch (error) {
        console.error('Get transaction summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get transaction summary',
            error: error.message
        });
    }
};

// Get customer star points
const getCustomerStarPoints = async (req, res) => {
    try {
        const { customer_id } = req.params;

        const [starPoints] = await db.pool.query(
            `SELECT sp.*, 
                    c.name as customer_name,
                    c.phone,
                    c.email,
                    c.discount_type,
                    c.discount_id_number
             FROM star_points sp
             JOIN customers c ON sp.customer_id = c.customer_id
             WHERE sp.customer_id = ?`,
            [customer_id]
        );

        if (starPoints.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Customer star points not found'
            });
        }

        const [transactions] = await db.pool.query(
            `SELECT spt.*,
                    CASE 
                        WHEN spt.transaction_type = 'EARNED' THEN s.invoice_number
                        ELSE NULL
                    END as invoice_number
             FROM star_points_transactions spt
             LEFT JOIN sales s ON spt.reference_transaction_id = s.id
             WHERE spt.star_points_id = ?
             ORDER BY spt.created_at DESC
             LIMIT 10`,
            [starPoints[0].star_points_id]
        );

        res.json({
            success: true,
            data: {
                ...starPoints[0],
                recent_transactions: transactions
            }
        });

    } catch (error) {
        console.error('Get customer star points error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get customer star points',
            error: error.message
        });
    }
};

// Redeem star points
const redeemStarPoints = async (req, res) => {
    const connection = await db.pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { customer_id, points_to_redeem, sale_id } = req.body;

        // Get customer's star points
        const [starPoints] = await connection.query(
            `SELECT * FROM star_points WHERE customer_id = ?`,
            [customer_id]
        );

        if (starPoints.length === 0 || starPoints[0].points_balance < points_to_redeem) {
            throw new Error('Insufficient points balance');
        }

        // Update star points balance
        await connection.query(
            `UPDATE star_points 
             SET points_balance = points_balance - ?,
                 total_points_redeemed = total_points_redeemed + ?,
                 updated_at = ${getMySQLTimestamp()}
             WHERE star_points_id = ?`,
            [points_to_redeem, points_to_redeem, starPoints[0].star_points_id]
        );

        // Record redemption transaction
        await connection.query(
            `INSERT INTO star_points_transactions (
                star_points_id,
                points_amount,
                transaction_type,
                reference_transaction_id,
                created_at
            ) VALUES (?, ?, 'REDEEMED', ?, ${getMySQLTimestamp()})`,
            [starPoints[0].star_points_id, points_to_redeem, sale_id]
        );

        // Update sale with points redeemed
        await connection.query(
            `UPDATE sales 
             SET points_redeemed = ?
             WHERE id = ?`,
            [points_to_redeem, sale_id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Points redeemed successfully',
            data: {
                new_balance: starPoints[0].points_balance - points_to_redeem
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Redeem points error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to redeem points',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    createTransaction,
    getTransactionSummary,
    getCustomerStarPoints,
    redeemStarPoints
}; 