const db = require('../config/database');
const { getMySQLTimestamp } = require('../utils/timeZoneUtil');

// Supplier Management
const getAllSuppliers = async (req, res) => {
    try {
        const [suppliers] = await db.pool.query(
            `SELECT * FROM suppliers WHERE is_active = 1 ORDER BY supplier_name`
        );
        console.log('Fetched all suppliers');
        res.json(suppliers);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ message: 'Error fetching suppliers' });
    }
};

// Get suppliers for a specific product
const getProductSuppliers = async (req, res) => {
    const { product_id } = req.params;
    try {
        const [suppliers] = await db.pool.query(
            `SELECT ps.*, s.supplier_name, s.contact_person, s.email, s.phone, 
                    p.name as product_name, p.brand_name
             FROM product_suppliers ps
             JOIN suppliers s ON ps.supplier_id = s.supplier_id
             JOIN products p ON ps.product_id = p.id
             WHERE ps.product_id = ? AND ps.is_active = 1 AND p.is_active = 1
             ORDER BY ps.is_preferred DESC, s.supplier_name`,
            [product_id]
        );
        console.log('Fetched suppliers for product:', product_id);
        res.json(suppliers);
    } catch (error) {
        console.error('Error fetching product suppliers:', error);
        res.status(500).json({ message: 'Error fetching product suppliers' });
    }
};

// Add supplier to a product
const addProductSupplier = async (req, res) => {
    const { product_id } = req.params;
    const { supplier_id, supplier_price, ceiling_price, is_preferred } = req.body;
    const connection = await db.pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // If this supplier is set as preferred, unset any existing preferred supplier
        if (is_preferred) {
            await connection.query(
                `UPDATE product_suppliers 
                 SET is_preferred = 0, 
                     updated_at = ${getMySQLTimestamp()}
                 WHERE product_id = ?`,
                [product_id]
            );
        }

        // Add new product supplier
        const [result] = await connection.query(
            `INSERT INTO product_suppliers 
             (product_id, supplier_id, supplier_price, ceiling_price, is_preferred, last_supply_date, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ${getMySQLTimestamp()}, ${getMySQLTimestamp()}, ${getMySQLTimestamp()})`,
            [product_id, supplier_id, supplier_price, ceiling_price, is_preferred]
        );

        // If this is the preferred supplier, update the product's current supplier
        if (is_preferred) {
            await connection.query(
                `UPDATE products 
                 SET current_supplier_id = ?, 
                     updatedAt = ${getMySQLTimestamp()}
                 WHERE id = ?`,
                [supplier_id, product_id]
            );
        }

        // Add to price history
        await connection.query(
            `INSERT INTO price_history 
             (product_id, product_supplier_id, supplier_price, ceiling_price, unit_price, markup_percentage, effective_date, created_at)
             SELECT ?, ?, ?, ?, p.price, p.markup_percentage, ${getMySQLTimestamp()}, ${getMySQLTimestamp()}
             FROM products p WHERE p.id = ?`,
            [product_id, result.insertId, supplier_price, ceiling_price, product_id]
        );

        await connection.commit();
        console.log('Added supplier to product:', product_id);
        res.json({ 
            id: result.insertId, 
            message: 'Product supplier added successfully' 
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error adding product supplier:', error);
        res.status(500).json({ message: 'Error adding product supplier' });
    } finally {
        connection.release();
    }
};

// Update product supplier
const updateProductSupplier = async (req, res) => {
    const { product_supplier_id } = req.params;
    const { supplier_price, ceiling_price, is_preferred } = req.body;
    const connection = await db.pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // Get product_id and supplier_id
        const [supplierInfo] = await connection.query(
            'SELECT product_id, supplier_id FROM product_suppliers WHERE product_supplier_id = ?',
            [product_supplier_id]
        );

        if (supplierInfo.length === 0) {
            throw new Error('Product supplier not found');
        }

        // If setting as preferred, unset any existing preferred supplier
        if (is_preferred) {
            await connection.query(
                `UPDATE product_suppliers 
                 SET is_preferred = 0,
                     updated_at = ${getMySQLTimestamp()}
                 WHERE product_id = ?`,
                [supplierInfo[0].product_id]
            );
        }

        // Update product supplier
        await connection.query(
            `UPDATE product_suppliers 
             SET supplier_price = ?, 
                 ceiling_price = ?,
                 is_preferred = ?,
                 last_supply_date = ${getMySQLTimestamp()},
                 updated_at = ${getMySQLTimestamp()}
             WHERE product_supplier_id = ?`,
            [supplier_price, ceiling_price, is_preferred, product_supplier_id]
        );

        // If this is the preferred supplier, update the product's current supplier
        if (is_preferred) {
            await connection.query(
                `UPDATE products 
                 SET current_supplier_id = ?,
                     updatedAt = ${getMySQLTimestamp()}
                 WHERE id = ?`,
                [supplierInfo[0].supplier_id, supplierInfo[0].product_id]
            );
        }

        // Add to price history
        await connection.query(
            `INSERT INTO price_history 
             (product_id, product_supplier_id, supplier_price, ceiling_price, unit_price, markup_percentage, effective_date, created_at)
             SELECT p.id, ?, ?, ?, p.price, p.markup_percentage, ${getMySQLTimestamp()}, ${getMySQLTimestamp()}
             FROM products p 
             WHERE p.id = ?`,
            [product_supplier_id, supplier_price, ceiling_price, supplierInfo[0].product_id]
        );

        await connection.commit();
        console.log('Updated product supplier:', product_supplier_id);
        res.json({ message: 'Product supplier updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating product supplier:', error);
        res.status(500).json({ message: 'Error updating product supplier' });
    } finally {
        connection.release();
    }
};

// Remove supplier from product
const removeProductSupplier = async (req, res) => {
    const { product_supplier_id } = req.params;
    const connection = await db.pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // Get product info before removal
        const [supplierInfo] = await connection.query(
            'SELECT product_id, supplier_id, is_preferred FROM product_suppliers WHERE product_supplier_id = ?',
            [product_supplier_id]
        );

        if (supplierInfo.length === 0) {
            throw new Error('Product supplier not found');
        }

        // Soft delete the product supplier
        await connection.query(
            `UPDATE product_suppliers 
             SET is_active = 0,
                 updated_at = ${getMySQLTimestamp()}
             WHERE product_supplier_id = ?`,
            [product_supplier_id]
        );

        // If this was the preferred supplier, update the product's current supplier
        if (supplierInfo[0].is_preferred) {
            // Find the next available supplier
            const [nextSupplier] = await connection.query(
                `SELECT supplier_id FROM product_suppliers 
                 WHERE product_id = ? AND is_active = 1 
                 ORDER BY supplier_price ASC LIMIT 1`,
                [supplierInfo[0].product_id]
            );

            await connection.query(
                `UPDATE products 
                 SET current_supplier_id = ?,
                     updatedAt = ${getMySQLTimestamp()}
                 WHERE id = ?`,
                [nextSupplier.length > 0 ? nextSupplier[0].supplier_id : null, supplierInfo[0].product_id]
            );
        }

        await connection.commit();
        console.log('Removed supplier from product:', product_supplier_id);
        res.json({ message: 'Product supplier removed successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error removing product supplier:', error);
        res.status(500).json({ message: 'Error removing product supplier' });
    } finally {
        connection.release();
    }
};

// Get price history for a product (including all suppliers)
const getProductPriceHistory = async (req, res) => {
    const { product_id } = req.params;
    try {
        const [history] = await db.pool.query(
            `SELECT ph.*, ps.supplier_id, s.supplier_name, 
                    p.name as product_name, p.brand_name
             FROM price_history ph
             JOIN product_suppliers ps ON ph.product_supplier_id = ps.product_supplier_id
             JOIN suppliers s ON ps.supplier_id = s.supplier_id
             JOIN products p ON ph.product_id = p.id
             WHERE ph.product_id = ? AND p.is_active = 1
             ORDER BY ph.effective_date DESC`,
            [product_id]
        );
        console.log('Fetched price history for product:', product_id);
        res.json(history);
    } catch (error) {
        console.error('Error fetching price history:', error);
        res.status(500).json({ message: 'Error fetching price history' });
    }
};

// Calculate and update product price based on supplier prices
const calculateProductPrice = async (req, res) => {
    const { product_id } = req.params;
    const { markup_percentage } = req.body;
    const connection = await db.pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // Get current supplier's price and ceiling price
        const [supplierInfo] = await connection.query(
            `SELECT ps.supplier_price, ps.ceiling_price, 
                    p.name as product_name, p.brand_name
             FROM product_suppliers ps
             JOIN products p ON ps.product_id = p.id
             WHERE p.id = ? AND ps.is_active = 1 AND p.is_active = 1
             AND ps.supplier_id = p.current_supplier_id`,
            [product_id]
        );

        if (supplierInfo.length === 0) {
            throw new Error('No active supplier found for product');
        }

        const supplier_price = supplierInfo[0].supplier_price;
        const ceiling_price = supplierInfo[0].ceiling_price;

        // Calculate new unit price
        let unit_price = supplier_price * (1 + markup_percentage / 100);
        
        // Check against ceiling price if it exists
        if (ceiling_price && unit_price > ceiling_price) {
            unit_price = ceiling_price;
        }

        // Update product price
        await connection.query(
            `UPDATE products 
             SET price = ?,
                 markup_percentage = ?,
                 updatedAt = ${getMySQLTimestamp()}
             WHERE id = ?`,
            [unit_price, markup_percentage, product_id]
        );

        await connection.commit();
        console.log('Updated product price calculation for:', supplierInfo[0].product_name);
        res.json({ 
            unit_price,
            markup_percentage,
            message: 'Product price updated successfully' 
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error calculating product price:', error);
        res.status(500).json({ message: 'Error calculating product price' });
    } finally {
        connection.release();
    }
};

module.exports = {
    // Supplier Management
    getAllSuppliers,
    getProductSuppliers,
    addProductSupplier,
    updateProductSupplier,
    removeProductSupplier,
    
    // Price Management
    getProductPriceHistory,
    calculateProductPrice
}; 