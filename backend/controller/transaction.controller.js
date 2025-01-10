const db = require('../config/database');
const { getConvertTZString, getMySQLTimestamp } = require('../utils/timeZoneUtil');

// Get transaction summary with enhanced metrics
const getTransactionSummary = async (req, res) => {
    try {
        const { timeFilter, startDate, endDate, branchId } = req.query;
        let query = '';
        let params = [];

        // Base query with timezone conversion and enhanced metrics
        const baseQuery = `
            SELECT 
                DATE_FORMAT(${getConvertTZString('s.created_at')}, '%Y-%m-%d') as date,
                COUNT(DISTINCT s.id) as transaction_count,
                CAST(COALESCE(SUM(s.total_amount), 0) AS DECIMAL(10,2)) as total_sales,
                CAST(COALESCE(SUM(s.discount_amount), 0) AS DECIMAL(10,2)) as total_discounts,
                COUNT(sr.return_id) as total_returns,
                CAST(COALESCE(SUM(CASE WHEN sr.return_id IS NOT NULL THEN sr.refund_amount ELSE 0 END), 0) AS DECIMAL(10,2)) as return_amount,
                COUNT(DISTINCT s.customer_id) as unique_customers,
                CAST(COALESCE(AVG(s.total_amount), 0) AS DECIMAL(10,2)) as average_transaction_value,
                s.branch_id,
                b.branch_name
            FROM sales s
            LEFT JOIN sales_returns sr ON s.id = sr.sale_id
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
                query += ` GROUP BY DATE_FORMAT(${getConvertTZString('s.created_at')}, '%Y-%m-%d %H:00:00'), s.branch_id`;
                break;
            case 'day':
                query += ` GROUP BY DATE_FORMAT(${getConvertTZString('s.created_at')}, '%Y-%m-%d'), s.branch_id`;
                break;
            case 'week':
                query += ` GROUP BY YEARWEEK(${getConvertTZString('s.created_at')}, 1), s.branch_id`;
                break;
            case 'month':
                query += ` GROUP BY DATE_FORMAT(${getConvertTZString('s.created_at')}, '%Y-%m'), s.branch_id`;
                break;
            case 'year':
                query += ` GROUP BY YEAR(${getConvertTZString('s.created_at')}), s.branch_id`;
                break;
            default:
                query += ` GROUP BY DATE_FORMAT(${getConvertTZString('s.created_at')}, '%Y-%m-%d'), s.branch_id`;
        }

        query += ' ORDER BY date DESC';

        const [results] = await db.pool.query(baseQuery + query, params);
        res.json(results);
    } catch (error) {
        console.error('Error fetching transaction summary:', error);
        res.status(500).json({ message: 'Error fetching transaction summary' });
    }
};

// Get latest transactions with enhanced details
const getLatestTransactions = async (req, res) => {
    try {
        const { branchId, limit = 10 } = req.query;
        let query = `
            SELECT 
                s.id,
                s.invoice_number,
                s.branch_id,
                ${getConvertTZString('s.created_at')} as created_at,
                CAST(s.total_amount AS DECIMAL(10,2)) as total_amount,
                CAST(s.discount_amount AS DECIMAL(10,2)) as discount_amount,
                s.discount_type,
                s.payment_method,
                s.payment_status,
                s.customer_name,
                s.points_earned,
                b.branch_name,
                COUNT(si.id) as item_count,
                GROUP_CONCAT(CONCAT(p.name, ' (', si.quantity, ')') SEPARATOR ', ') as items
            FROM sales s
            JOIN branches b ON s.branch_id = b.branch_id
            LEFT JOIN sale_items si ON s.id = si.sale_id
            LEFT JOIN products p ON si.product_id = p.id
            WHERE 1=1
        `;
        let params = [];

        if (branchId) {
            query += ' AND s.branch_id = ?';
            params.push(branchId);
        }

        query += ' GROUP BY s.id ORDER BY s.created_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const [results] = await db.pool.query(query, params);
        res.json(results);
    } catch (error) {
        console.error('Error fetching latest transactions:', error);
        res.status(500).json({ message: 'Error fetching latest transactions' });
    }
};

// Get key metrics with enhanced statistics
const getKeyMetrics = async (req, res) => {
    try {
        const { branchId, startDate, endDate } = req.query;
        let params = [];
        let branchCondition = branchId ? 'AND s.branch_id = ?' : '';
        if (branchId) params.push(branchId);

        // Main metrics query
        const metricsQuery = `
            SELECT 
                COUNT(DISTINCT s.id) as total_transactions,
                CAST(COALESCE(SUM(s.total_amount), 0) AS DECIMAL(10,2)) as total_sales,
                CAST(COALESCE(AVG(s.total_amount), 0) AS DECIMAL(10,2)) as average_transaction_value,
                CAST(COALESCE(SUM(s.discount_amount), 0) AS DECIMAL(10,2)) as total_discounts,
                COUNT(DISTINCT sr.return_id) as total_returns,
                CAST(COALESCE(SUM(CASE WHEN sr.return_id IS NOT NULL THEN sr.refund_amount ELSE 0 END), 0) AS DECIMAL(10,2)) as total_return_amount,
                COUNT(DISTINCT s.customer_id) as unique_customers,
                CAST(COALESCE(SUM(CASE WHEN s.payment_status = 'paid' THEN s.total_amount ELSE 0 END), 0) AS DECIMAL(10,2)) as paid_amount,
                COUNT(DISTINCT CASE WHEN s.payment_status = 'paid' THEN s.id END) as paid_transactions,
                CAST(COALESCE(SUM(s.points_earned), 0) AS DECIMAL(10,2)) as total_points_earned,
                COUNT(DISTINCT CASE WHEN s.discount_type != 'None' THEN s.id END) as discounted_transactions,
                CAST(COALESCE(MAX(s.total_amount), 0) AS DECIMAL(10,2)) as highest_transaction,
                CAST(COALESCE(MIN(CASE WHEN s.total_amount > 0 THEN s.total_amount END), 0) AS DECIMAL(10,2)) as lowest_transaction,
                COUNT(DISTINCT DATE(${getConvertTZString('s.created_at')})) as active_days
            FROM sales s
            LEFT JOIN sales_returns sr ON s.id = sr.sale_id
            WHERE ${getConvertTZString('s.created_at')} BETWEEN ? AND ?
            ${branchCondition}
        `;

        // Payment methods distribution query
        const paymentMethodsQuery = `
            SELECT 
                payment_method,
                COUNT(*) as count
            FROM sales s
            WHERE ${getConvertTZString('s.created_at')} BETWEEN ? AND ?
            ${branchCondition}
            GROUP BY payment_method
        `;

        // Discount types distribution query
        const discountTypesQuery = `
            SELECT 
                discount_type,
                COUNT(*) as count
            FROM sales s
            WHERE ${getConvertTZString('s.created_at')} BETWEEN ? AND ?
            ${branchCondition}
            GROUP BY discount_type
        `;

        params.unshift(startDate || '2024-01-01', endDate || new Date().toISOString().split('T')[0]);
        const paymentParams = [...params];
        const discountParams = [...params];

        const [metricsResults] = await db.pool.query(metricsQuery, params);
        const [paymentResults] = await db.pool.query(paymentMethodsQuery, paymentParams);
        const [discountResults] = await db.pool.query(discountTypesQuery, discountParams);

        // Convert array of payment methods to object
        const paymentMethodDistribution = paymentResults.reduce((acc, curr) => {
            acc[curr.payment_method] = curr.count;
            return acc;
        }, {});

        // Convert array of discount types to object
        const discountTypeDistribution = discountResults.reduce((acc, curr) => {
            acc[curr.discount_type] = curr.count;
            return acc;
        }, {});

        // Combine all results
        const combinedResults = {
            ...metricsResults[0],
            payment_method_distribution: paymentMethodDistribution,
            discount_type_distribution: discountTypeDistribution
        };

        res.json(combinedResults);
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