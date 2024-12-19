const db = require('../config/database');
const { getMySQLTimestamp, getCurrentTimestamp } = require('../utils/timeZoneUtil');

// Get session summary for reconciliation
const getSessionSummary = async (req, res) => {
    const { sessionId } = req.params;

    try {
        // Get session info regardless of transactions
        const [results] = await db.pool.query(
            `SELECT 
                COALESCE(COUNT(s.id), 0) as total_transactions,
                COALESCE(SUM(s.total_amount), 0) as total_amount,
                p.name as pharmacist_name,
                p.staff_id as pharmacist_code,
                b.branch_id,
                b.branch_name,
                ps.pharmacist_session_id as session_id,
                ss.session_id as sales_session_id
            FROM pharmacist_sessions ps
            JOIN pharmacist p ON ps.staff_id = p.staff_id
            JOIN branches b ON p.branch_id = b.branch_id
            JOIN sales_sessions ss ON ps.session_id = ss.session_id
            LEFT JOIN sales s ON s.pharmacist_session_id = ps.pharmacist_session_id
            WHERE ps.pharmacist_session_id = ?
            GROUP BY ps.pharmacist_session_id`,
            [sessionId]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.json(results[0]);
    } catch (error) {
        console.error('Error getting session summary:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Save cash reconciliation and end session
const saveCashReconciliation = async (req, res) => {
    const connection = await db.pool.getConnection();
    
    try {
        await connection.beginTransaction();

        const reconciliationData = {
            ...req.body,
            created_at: getMySQLTimestamp()
        };

        // Insert reconciliation record
        const [result] = await connection.query(
            `INSERT INTO cash_reconciliation SET ?`,
            reconciliationData
        );

        // Get the sales_session_id
        const [sessionResult] = await connection.query(
            `SELECT ss.session_id, ss.total_sales 
             FROM sales_sessions ss
             JOIN pharmacist_sessions ps ON ss.session_id = ps.session_id
             WHERE ps.pharmacist_session_id = ?`,
            [reconciliationData.pharmacist_session_id]
        );

        if (sessionResult.length === 0) {
            throw new Error('Sales session not found');
        }

        // Update sales session end time and total sales
        await connection.query(
            `UPDATE sales_sessions 
             SET end_time = ${getMySQLTimestamp()},
                 total_sales = COALESCE((
                     SELECT SUM(total_amount) 
                     FROM sales s
                     JOIN pharmacist_sessions ps ON s.pharmacist_session_id = ps.pharmacist_session_id
                     WHERE ps.session_id = ?
                 ), 0),
                 updated_at = ${getMySQLTimestamp()}
             WHERE session_id = ?`,
            [sessionResult[0].session_id, sessionResult[0].session_id]
        );

        await connection.commit();

        res.json({
            success: true,
            reconciliation_id: result.insertId,
            message: 'Cash reconciliation saved and session ended successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error in cash reconciliation and session end:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to save cash reconciliation and end session',
            error: error.message 
        });
    } finally {
        connection.release();
    }
};

// Check if session has transactions
const checkSessionTransactions = async (req, res) => {
    const { sessionId } = req.params;

    try {
        const [results] = await db.pool.query(
            `SELECT COUNT(s.id) as transaction_count
             FROM sales s
             WHERE s.pharmacist_session_id = ?`,
            [sessionId]
        );

        res.json({
            hasTransactions: results[0].transaction_count > 0,
            transactionCount: results[0].transaction_count
        });
    } catch (error) {
        console.error('Error checking session transactions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getSessionSummary,
    saveCashReconciliation,
    checkSessionTransactions
}; 