const db = require('../config/database');
const { getMySQLTimestamp, getCurrentTimestamp, getConvertTZString } = require('../utils/timeZoneUtil');

// Get dashboard overview data
const getDashboardOverview = async (req, res) => {
    try {
        const [result] = await db.pool.query(`
            SELECT 
                (SELECT COALESCE(SUM(total_amount), 0) 
                 FROM sales 
                 WHERE DATE(created_at) = CURDATE()) as todaySales,
                
                (SELECT COUNT(*) 
                 FROM medicines 
                 WHERE is_active = 1) as totalProducts,
                
                (SELECT COUNT(*) 
                 FROM sales 
                 WHERE DATE(created_at) = CURDATE()) as totalOrders,
                
                (SELECT COUNT(*) 
                 FROM customers 
                 WHERE is_active = 1) as totalCustomers
        `);

        res.json(result[0]);
    } catch (error) {
        console.error('Error fetching dashboard overview:', error);
        res.status(500).json({ message: 'Error fetching dashboard overview' });
    }
};

// Get recent transactions
const getRecentTransactions = async (req, res) => {
    try {
        const [transactions] = await db.pool.query(`
            SELECT 
                s.transaction_id,
                COALESCE(c.name, 'Walk-in Customer') as customer_name,
                s.total_amount,
                ${getConvertTZString('s.created_at')} as transaction_date,
                COUNT(si.sale_item_id) as item_count
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.customer_id
            LEFT JOIN sale_items si ON s.transaction_id = si.transaction_id
            GROUP BY s.transaction_id
            ORDER BY s.created_at DESC
            LIMIT 5
        `);

        res.json({ transactions });
    } catch (error) {
        console.error('Error fetching recent transactions:', error);
        res.status(500).json({ message: 'Error fetching recent transactions' });
    }
};

// Get low stock items
const getLowStockItems = async (req, res) => {
    try {
        const [items] = await db.pool.query(`
            SELECT 
                m.medicine_name,
                m.current_stock,
                m.reorder_point
            FROM medicines m
            WHERE m.current_stock <= m.reorder_point
                AND m.is_active = 1
            ORDER BY (m.reorder_point - m.current_stock) DESC
            LIMIT 5
        `);

        res.json({ items });
    } catch (error) {
        console.error('Error fetching low stock items:', error);
        res.status(500).json({ message: 'Error fetching low stock items' });
    }
};

module.exports = {
    getDashboardOverview,
    getRecentTransactions,
    getLowStockItems
}; 