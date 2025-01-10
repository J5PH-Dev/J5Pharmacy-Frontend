const db = require('../config/database').pool; // Import the promisePool from your database configuration
const timeZoneUtil = require('../utils/timeZoneUtil');

// Fetch medicine groups and counts dynamically
exports.getMedicineGroups = async (req, res) => {
    try {
        // Get all categories with product counts using LEFT JOIN
        const [categories] = await db.query(`
            SELECT 
                c.category_id,
                c.name,
                c.prefix,
                COALESCE(COUNT(CASE WHEN p.is_active = 1 THEN p.id END), 0) as product_count
            FROM category c
            LEFT JOIN products p ON p.category = c.category_id AND p.is_active = 1
            GROUP BY c.category_id, c.name, c.prefix
            ORDER BY c.name ASC
        `);

        // Map the results
        const result = categories.map(category => ({
            category_id: category.category_id,
            name: category.name,
            prefix: category.prefix,
            product_count: parseInt(category.product_count) || 0
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching medicine groups:', error);
        res.status(500).json({ message: 'Failed to fetch medicine groups', error });
    }
};

// Add a new medicine group/category
exports.addMedicineGroup = async (req, res) => {
    const { name, prefix } = req.body;

    if (!name || typeof name !== 'string') {
        return res.status(400).json({ message: 'Category name is required and must be a string.' });
    }

    try {
        await db.query('START TRANSACTION');

        // Check if the category already exists
        const [existingCategory] = await db.query(
            'SELECT * FROM category WHERE name = ? LIMIT 1',
            [name]
        );

        if (existingCategory.length > 0) {
            await db.query('ROLLBACK');
            return res.status(409).json({ message: 'Category already exists.' });
        }

        // Insert the new category into the database with prefix
        const [result] = await db.query(
            'INSERT INTO category (name, prefix) VALUES (?, ?)',
            [name, prefix || '']
        );

        // Initialize the barcode counter for this category
        await db.query(
            'INSERT INTO category_barcode_counter (category_id, last_number) VALUES (?, 0)',
            [result.insertId]
        );

        await db.query('COMMIT');
        res.status(201).json({ message: 'New category added successfully.' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error adding new category:', error);
        res.status(500).json({ message: 'Failed to add new category', error });
    }
};


// Delete category by name
exports.deleteCategoryView = async (req, res) => {
    const { groupName } = req.params; // Get the group name from the URL parameters

    try {
        // Check if the category exists
        const [categoryExists] = await db.query('SELECT * FROM category WHERE name = ?', [groupName]);

        if (categoryExists.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Proceed to delete the category
        await db.query('DELETE FROM category WHERE name = ?', [groupName]);

        res.status(200).json({ message: `Category "${groupName}" deleted successfully` });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Failed to delete category', error });
    }
};


// Delete categories by names (for multiple deletions)
exports.deleteCategories = async (req, res) => {
    const { groupNames } = req.body; // Get the group names from the request body

    try {
        if (!Array.isArray(groupNames) || groupNames.length === 0) {
            return res.status(400).json({ message: 'No categories selected for deletion' });
        }

        // Ensure all categories exist
        const placeholders = groupNames.map(() => '?').join(',');
        const [categoriesExists] = await db.query(`SELECT * FROM category WHERE name IN (${placeholders})`, groupNames);

        if (categoriesExists.length !== groupNames.length) {
            return res.status(404).json({ message: 'One or more categories not found' });
        }

        // Proceed to delete the categories
        await db.query(`DELETE FROM category WHERE name IN (${placeholders})`, groupNames);

        res.status(200).json({ message: `Categories deleted successfully: ${groupNames.join(', ')}` });
    } catch (error) {
        console.error('Error deleting categories:', error);
        res.status(500).json({ message: 'Failed to delete categories', error });
    }
};

exports.updateMedicineGroup = async (req, res) => {
    const { categoryId, name, prefix } = req.body;

    if (!categoryId || !name) {
        return res.status(400).json({ message: 'Category ID and name are required.' });
    }

    // Don't allow updating NO CATEGORY (ID: 12)
    if (categoryId === 12) {
        return res.status(400).json({ message: 'Cannot modify NO CATEGORY as it is a system category' });
    }

    try {
        // Check if category exists
        const [existingCategory] = await db.query(
            'SELECT * FROM category WHERE category_id = ?',
            [categoryId]
        );

        if (existingCategory.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check if new name already exists for a different category
        const [duplicateName] = await db.query(
            'SELECT * FROM category WHERE name = ? AND category_id != ?',
            [name, categoryId]
        );

        if (duplicateName.length > 0) {
            return res.status(409).json({ message: 'A category with this name already exists' });
        }

        // Update the category
        await db.query(
            'UPDATE category SET name = ?, prefix = ? WHERE category_id = ?',
            [name, prefix || '', categoryId]
        );

        res.status(200).json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Failed to update category', error });
    }
};


const categoryMap = {
    1: 'BRANDED',
    2: 'GENERIC',
    3: 'COSMETICS',
    4: 'DIAPER',
    5: 'FACE AND BODY',
    6: 'GALENICALS',
    7: 'MILK',
    8: 'PILLS AND CONTRACEPTIVES',
    9: 'SYRUP',
    10: 'OTHERS',
};

// Route to save changes and update product category
exports.saveMedicineGroup = async (req, res) => {
    const { groupName, selectedMedicines } = req.body; // Extract the data from the request body

    // Check if the groupName is valid
    const categoryId = Object.keys(categoryMap).find(key => categoryMap[key] === groupName);
    if (!categoryId) {
        return res.status(400).json({ message: 'Invalid category name' });
    }

    try {
        // Check if the category exists in the database
        const [categoryExists] = await db.query(`
            SELECT COUNT(*) AS count FROM category WHERE category_id = ?
        `, [categoryId]);

        if (categoryExists.count === 0) {
            return res.status(400).json({ message: 'Category does not exist in the database' });
        }

        // Start a transaction to update the products' categories
        await db.query('START TRANSACTION');

        // Build the query to update all selected products in one go
        const updateQueries = selectedMedicines.map(medicine => {
            return db.query(`
                UPDATE products
                SET category = ?
                WHERE name = ?
            `, [categoryId, medicine]);
        });

        // Wait for all the update queries to complete
        await Promise.all(updateQueries);

        // Commit the transaction after all updates
        await db.query('COMMIT');

        // Return a success message
        res.status(200).json({ message: 'Medicine group updated successfully' });
    } catch (error) {
        // Rollback the transaction in case of any error
        await db.query('ROLLBACK');
        console.error('Error updating medicine group:', error);
        res.status(500).json({ message: 'Failed to update medicine group', error });
    }
};

// Modify the controller to fetch data dynamically from the database
exports.getMedicinesAndStock = async (req, res) => {
    const { groupName } = req.params;

    // Category mapping
    const categoryMapping = {
        'BRANDED': 1,
        'GENERIC': 2,
        'COSMETICS': 3,
        'DIAPER': 4,
        'FACE AND BODY': 5,
        'GALENICALS': 6,
        'MILK': 7,
        'PILLS AND CONTRACEPTIVES': 8,
        'SYRUP': 9,
        'OTHERS': 10,
    };

    // Map groupName to category number
    const categoryNumber = categoryMapping[groupName];

    // If the category is not valid, return an error
    if (!categoryNumber) {
        return res.status(400).json({ message: 'Invalid groupName' });
    }

    try {
        // Fetch medicines for the specified category
        const [medicines] = await db.query(
            `SELECT name AS medicine_name, stock 
            FROM products 
            WHERE category = ?`,
            [categoryNumber]
        );

        res.status(200).json(medicines);
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(500).json({ message: 'Failed to fetch medicines', error });
    }
};

// Update product stock
exports.updateProductStock = async (req, res) => {
    const { medicineName, newStock } = req.body;

    if (!medicineName || newStock === undefined) {
        return res.status(400).json({ message: 'Medicine name and new stock are required' });
    }

    try {
        // Update the stock in the database
        const [result] = await db.query(
            `UPDATE products SET stock = ? WHERE name = ?`,
            [newStock, medicineName]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        res.status(200).json({ message: 'Stock updated successfully' });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ message: 'Failed to update stock', error });
    }
};


exports.deleteCategory = async (req, res) => {
    const { groupName } = req.params;

    if (!groupName) {
        return res.status(400).json({ message: 'Group name is required' });
    }

    try {
        // Delete the category from the database
        const [result] = await db.query(
            `DELETE FROM category WHERE name = ?`,
            [groupName]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Failed to delete category', error });
    }
};

// Update products in the category to have NULL categoryId instead of deleting the category
exports.deleteMultipleCategories = async (req, res) => {
    const { groupNames } = req.body; // Expects an array of group names

    if (!Array.isArray(groupNames) || groupNames.length === 0) {
        return res.status(400).json({ message: 'Group names are required' });
    }

    try {
        // Loop through each group name and update the products in the category
        for (let groupName of groupNames) {
            // Check if the category exists
            const [categoryExists] = await db.query('SELECT * FROM category WHERE name = ?', [groupName]);

            if (categoryExists.length === 0) {
                continue; // Skip non-existing categories
            }

            // Update the products to set the categoryId to NULL (or another appropriate value)
            await db.query(
                'UPDATE products SET category = NULL WHERE category = (SELECT category_id FROM category WHERE name = ?)',
                [groupName]
            );
        }

        res.status(200).json({ message: 'Products in categories updated successfully' });
    } catch (error) {
        console.error('Error updating products in categories:', error);
        res.status(500).json({ message: 'Failed to update products in categories', error });
    }
};

    exports.getLowStockProducts = async (req, res) => {
    try {
        // Query the database to get products with stock <= 30
        const [lowStockProducts] = await db.query(
            'SELECT name, barcode, category, stock FROM products WHERE stock <= 30'
        );

        // Check if products are found
        if (lowStockProducts.length === 0) {
            return res.status(200).json({ message: 'No products with stock below 30.' });
        }

        // Return the products
        res.status(200).json({ products: lowStockProducts });
    } catch (error) {
        console.error('Error fetching low stock products:', error);
        res.status(500).json({ message: 'Failed to fetch low stock products.', error });
    }
};

// Archive a category
exports.archiveCategory = async (req, res) => {
    const { categoryId } = req.params;
    const { archivedBy } = req.body;

    if (!categoryId || !archivedBy) {
        return res.status(400).json({ message: 'Category ID and user ID are required' });
    }

    // Don't allow archiving of NO CATEGORY (ID: 12)
    if (categoryId === '12') {
        return res.status(400).json({ message: 'Cannot archive NO CATEGORY as it is a system category' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Get category details before archiving
        const [category] = await connection.query(
            'SELECT * FROM category WHERE category_id = ? AND is_active = 1',
            [categoryId]
        );

        if (category.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Category not found or already archived' });
        }

        // Check if category is already in archive
        const [existingArchive] = await connection.query(
            'SELECT * FROM category_archive WHERE category_id = ?',
            [categoryId]
        );

        if (existingArchive.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: 'Category is already archived' });
        }

        // Get affected products
        const [affectedProducts] = await connection.query(
            'SELECT id, name, brand_name FROM products WHERE category = ? AND is_active = TRUE',
            [categoryId]
        );

        // First, update all products to NO CATEGORY (12)
        await connection.query(
            'UPDATE products SET category = 12, updatedat = ? WHERE category = ?',
            [timeZoneUtil.getCurrentTimestamp(), categoryId]
        );

        // Insert into category_archive
        await connection.query(
            `INSERT INTO category_archive (
                category_id, name, prefix, archived_by, archived_at
            ) VALUES (?, ?, ?, ?, ${timeZoneUtil.getMySQLTimestamp()})`,
            [categoryId, category[0].name, category[0].prefix, archivedBy]
        );

        // Update category to set it as inactive instead of deleting
        await connection.query(
            'UPDATE category SET is_active = 0, updated_at = ? WHERE category_id = ?',
            [timeZoneUtil.getCurrentTimestamp(), categoryId]
        );

        await connection.commit();
        res.json({ 
            message: 'Category archived successfully',
            affectedProducts: affectedProducts,
            details: {
                categoryName: category[0].name,
                prefix: category[0].prefix,
                productsAffected: affectedProducts.length,
                archivedAt: timeZoneUtil.getCurrentTimestamp()
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error archiving category:', error);
        res.status(500).json({ 
            message: 'Failed to archive category',
            error: error.message 
        });
    } finally {
        connection.release();
    }
};

exports.getCategoryProducts = async (req, res) => {
    const { categoryId } = req.params;

    try {
        // Get products that would be affected by archiving this category
        const [affectedProducts] = await db.query(
            'SELECT id, name, brand_name FROM products WHERE category = ? AND is_active = 1',
            [categoryId]
        );

        res.json({ 
            affectedProducts: affectedProducts
        });
    } catch (error) {
        console.error('Error getting category products:', error);
        res.status(500).json({ message: 'Failed to get category products' });
    }
};

// Get next available barcode number for a category
exports.getNextBarcode = async (req, res) => {
    const { categoryId } = req.params;

    try {
        // Get category prefix
        const [category] = await db.query(
            'SELECT prefix FROM category WHERE category_id = ?',
            [categoryId]
        );

        if (!category || category.length === 0) {
            throw new Error('Category not found');
        }

        const prefix = category[0].prefix;
        if (!prefix) {
            throw new Error('Category has no prefix defined');
        }

        // Get current counter value
        const [counter] = await db.query(`
            SELECT COALESCE(last_number + 1, 1) as next_number 
            FROM category_barcode_counter 
            WHERE category_id = ?
        `, [categoryId]);

        // If no counter exists yet, start with 1
        const nextNumber = counter.length > 0 ? counter[0].next_number : 1;
        const barcode = `${prefix}-${nextNumber.toString().padStart(5, '0')}`;

        // Check if barcode exists
        const [existingProduct] = await db.query(
            'SELECT id FROM products WHERE barcode = ?',
            [barcode]
        );

        if (existingProduct.length > 0) {
            // If exists, try next number
            req.params.startFrom = nextNumber + 1;
            return this.getNextBarcode(req, res);
        }

        res.json({ barcode });
    } catch (error) {
        console.error('Error getting next barcode:', error);
        res.status(500).json({ message: error.message });
    }
};

// Increment barcode counter for a category
exports.incrementBarcodeCounter = async (categoryId, barcode) => {
    try {
        await db.query('START TRANSACTION');

        // Extract the number from the barcode
        const number = parseInt(barcode.split('-')[1]);

        // Update or insert the counter
        await db.query(`
            INSERT INTO category_barcode_counter (category_id, last_number)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE last_number = ?
        `, [categoryId, number, number]);

        await db.query('COMMIT');
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error incrementing barcode counter:', error);
        throw error;
    }
};