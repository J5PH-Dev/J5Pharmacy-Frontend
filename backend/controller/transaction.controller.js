const db = require('../config/database');
const { getConvertTZString, getMySQLTimestamp } = require('../utils/timeZoneUtil');

// Get transaction summary based on time filter
const getTransactionSummary = async (req, res) => {
    try {
        const { timeFilter, startDate, endDate, branchId } = req.query;
        let query = '';
        let params = [];

        // Base query with timezone conversion
        const baseQuery = `
            SELECT 
                ${getConvertTZString('s.created_at')} as date,
                SUM(s.total_amount) as total_sales,
                SUM(s.discount_amount) as total_discounts,
                COUNT(sr.return_id) as total_returns,
                SUM(CASE WHEN sr.return_id IS NOT NULL THEN sr.return_amount ELSE 0 END) as return_amount,
                s.branch_id,
                b.branch_name
            FROM sales s
            LEFT JOIN sales_returns sr ON s.sale_id = sr.sale_id
            LEFT JOIN branches b ON s.branch_id = b.branch_id
            WHERE 1=1
        `;

        // Add branch filter if specified
        if (branchId) {
            query += ' AND s.branch_id = ?';
            params.push(branchId);
        }

        // Add date range filter
        if (startDate && endDate) {
            query += ` AND ${getConvertTZString('s.created_at')} BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        }

        // Add group by based on time filter
        switch(timeFilter) {
            case 'hour':
                query += ' GROUP BY HOUR(created_at), DATE(created_at), s.branch_id';
                break;
            case 'day':
                query += ' GROUP BY DATE(created_at), s.branch_id';
                break;
            case 'week':
                query += ' GROUP BY WEEK(created_at), YEAR(created_at), s.branch_id';
                break;
            case 'month':
                query += ' GROUP BY MONTH(created_at), YEAR(created_at), s.branch_id';
                break;
            case 'year':
                query += ' GROUP BY YEAR(created_at), s.branch_id';
                break;
            default:
                query += ' GROUP BY DATE(created_at), s.branch_id';
        }

        query += ' ORDER BY created_at DESC';

        const [results] = await db.pool.query(baseQuery + query, params);
        res.json(results);
    } catch (error) {
        console.error('Error fetching transaction summary:', error);
        res.status(500).json({ message: 'Error fetching transaction summary' });
    }
};

// Get latest transactions in real-time
const getLatestTransactions = async (req, res) => {
    try {
        const { branchId, limit = 10 } = req.query;
        let query = `
            SELECT 
                s.invoice_number,
                s.branch_id,
                ${getConvertTZString('s.created_at')} as created_at,
                s.total_amount,
                b.branch_name
            FROM sales s
            JOIN branches b ON s.branch_id = b.branch_id
            WHERE 1=1
        `;
        let params = [];

        if (branchId) {
            query += ' AND s.branch_id = ?';
            params.push(branchId);
        }

        query += ' ORDER BY s.created_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const [results] = await db.pool.query(query, params);
        res.json(results);
    } catch (error) {
        console.error('Error fetching latest transactions:', error);
        res.status(500).json({ message: 'Error fetching latest transactions' });
    }
};

// Get key metrics
const getKeyMetrics = async (req, res) => {
    try {
        const { startDate, endDate, branchId } = req.query;

        let whereClause = `WHERE ${getConvertTZString('s.created_at')} BETWEEN ? AND ?`;
        let params = [startDate, endDate];

        if (branchId) {
            whereClause += ' AND s.branch_id = ?';
            params.push(branchId);
        }

        const [results] = await db.pool.query(`
            SELECT 
                COUNT(DISTINCT s.transaction_id) as total_transactions,
                SUM(s.total_amount) as total_sales,
                AVG(s.total_amount) as average_transaction_value,
                SUM(s.discount_amount) as total_discounts,
                COUNT(DISTINCT sr.return_id) as total_returns,
                SUM(CASE WHEN sr.return_id IS NOT NULL THEN sr.return_amount ELSE 0 END) as total_return_amount,
                COUNT(DISTINCT s.customer_id) as unique_customers
            FROM sales s
            LEFT JOIN sales_returns sr ON s.transaction_id = sr.transaction_id
            ${whereClause}
        `, params);

        res.json(results[0]);
    } catch (error) {
        console.error('Error fetching key metrics:', error);
        res.status(500).json({ message: 'Error fetching key metrics' });
    }
};

module.exports = {
    getTransactionSummary,
    getLatestTransactions,
    getKeyMetrics
}; 