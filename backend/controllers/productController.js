const db = require('../config/database');

// Search products
const searchProducts = async (req, res) => {
    try {
        const { query, barcode } = req.query;
        let sql = `
            SELECT 
                p.*,
                c.name as category_name,
                p.stock * p.pieces_per_box as total_pieces
            FROM products p 
            LEFT JOIN categories c ON p.category = c.id 
            WHERE 1=1
        `;
        const params = [];

        if (barcode) {
            sql += ` AND p.barcode = ?`;
            params.push(barcode);
        } else if (query) {
            sql += ` AND (p.name LIKE ? OR p.brand_name LIKE ? OR p.barcode LIKE ?)`;
            const searchTerm = `%${query}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        sql += ` ORDER BY p.name ASC LIMIT 50`;

        const [products] = await db.query(sql, params);
        
        // Transform the data to match frontend expectations
        const transformedProducts = products.map(product => ({
            id: product.id,
            name: product.name,
            brand_name: product.brand_name,
            description: product.description,
            sideEffects: product.sideEffects,
            dosage_amount: product.dosage_amount,
            dosage_unit: product.dosage_unit,
            price: product.price,
            stock: product.stock,
            pieces_per_box: product.pieces_per_box,
            category: product.category_name,
            barcode: product.barcode,
            requiresPrescription: Boolean(product.requiresPrescription),
            expiryDate: product.expiryDate,
            totalPieces: product.total_pieces
        }));

        res.json(transformedProducts);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ message: 'Error searching products' });
    }
};

// Hold transaction
const holdTransaction = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { salesSessionId, customerId, items, holdNumber } = req.body;
        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        // Create held transaction record
        const [result] = await connection.query(
            'INSERT INTO held_transactions (sales_session_id, customer_id, hold_number, total_amount) VALUES (?, ?, ?, ?)',
            [salesSessionId, customerId || null, holdNumber, totalAmount]
        );

        const heldTransactionId = result.insertId;

        // Insert held transaction items
        for (const item of items) {
            await connection.query(
                'INSERT INTO held_transaction_items (held_transaction_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
                [heldTransactionId, item.id, item.quantity, item.price, item.quantity * item.price]
            );
        }

        await connection.commit();
        res.json({ message: 'Transaction held successfully', heldTransactionId });
    } catch (error) {
        await connection.rollback();
        console.error('Error holding transaction:', error);
        res.status(500).json({ message: 'Error holding transaction' });
    } finally {
        connection.release();
    }
};

// Recall transaction
const recallTransaction = async (req, res) => {
    try {
        const { salesSessionId, holdNumber } = req.query;
        
        const [transaction] = await db.query(
            `SELECT 
                ht.*,
                hti.*,
                p.*,
                c.name as category_name,
                p.stock * p.pieces_per_box as total_pieces
            FROM held_transactions ht
            JOIN held_transaction_items hti ON ht.id = hti.held_transaction_id
            JOIN products p ON hti.product_id = p.id
            LEFT JOIN categories c ON p.category = c.id
            WHERE ht.sales_session_id = ? AND ht.hold_number = ?`,
            [salesSessionId, holdNumber]
        );

        if (!transaction.length) {
            return res.status(404).json({ message: 'Held transaction not found' });
        }

        // Format the response to match frontend expectations
        const items = transaction.map(item => ({
            id: item.product_id,
            name: item.name,
            brand_name: item.brand_name,
            description: item.description,
            sideEffects: item.sideEffects,
            dosage_amount: item.dosage_amount,
            dosage_unit: item.dosage_unit,
            price: item.unit_price,
            quantity: item.quantity,
            stock: item.stock,
            pieces_per_box: item.pieces_per_box,
            category: item.category_name,
            barcode: item.barcode,
            requiresPrescription: Boolean(item.requiresPrescription),
            expiryDate: item.expiryDate,
            totalPieces: item.total_pieces
        }));

        res.json({
            id: transaction[0].held_transaction_id,
            customerId: transaction[0].customer_id,
            totalAmount: transaction[0].total_amount,
            items
        });
    } catch (error) {
        console.error('Error recalling transaction:', error);
        res.status(500).json({ message: 'Error recalling transaction' });
    }
};

// Delete held transaction
const deleteHeldTransaction = async (req, res) => {
    try {
        const { salesSessionId, holdNumber } = req.params;
        
        const [result] = await db.query(
            'DELETE FROM held_transactions WHERE sales_session_id = ? AND hold_number = ?',
            [salesSessionId, holdNumber]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Held transaction not found' });
        }

        res.json({ message: 'Held transaction deleted successfully' });
    } catch (error) {
        console.error('Error deleting held transaction:', error);
        res.status(500).json({ message: 'Error deleting held transaction' });
    }
};

// Make sure all functions are properly exported
module.exports = {
    searchProducts,
    holdTransaction,
    recallTransaction,
    deleteHeldTransaction
}; 