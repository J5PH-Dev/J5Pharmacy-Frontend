const db = require('../config/database').pool; // Import the promisePool from your database configuration


// Fetch medicine groups and counts dynamically
exports.getMedicineGroups = async (req, res) => {
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

    try {
        // Step 1: Query to get all categories from the category table
        const [categories] = await db.query(`
            SELECT category_id, name FROM category
        `);

        // Step 2: Query to get the count of products per category from the products table
        const [products] = await db.query(`
            SELECT category, COUNT(*) AS noOfMedicine
            FROM products
            GROUP BY category
        `);

        // Step 3: Map the results by joining the category names with the product counts
        const result = categories.map(category => {
            // Find the product count for the current category
            const productCount = products.find(product => product.category === category.category_id);

            // Get the category name using the categoryMap
            const groupName = categoryMap[category.category_id] || category.name; // Fallback to the name if not found in categoryMap

            return {
                groupName, // Category name from categoryMap
                noOfMedicine: productCount ? productCount.noOfMedicine : 0 // Product count (0 if no products found)
            };
        });

        res.status(200).json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error fetching medicine groups:', error);
        res.status(500).json({ message: 'Failed to fetch medicine groups', error });
    }
};

// Add a new medicine group/cate// Add a new medicine group/category
exports.addMedicineGroup = async (req, res) => {
    const { categoryName } = req.body;

    if (!categoryName || typeof categoryName !== 'string') {
        return res.status(400).json({ message: 'Category name is required and must be a string.' });
    }

    try {
        // Check if the category already exists
        const [existingCategory] = await db.query(
            'SELECT * FROM category WHERE name = ? LIMIT 1',
            [categoryName]
        );

        if (existingCategory.length > 0) {
            return res.status(409).json({ message: 'Category already exists.' });
        }

        // Insert the new category into the database
        await db.query(
            'INSERT INTO category (name) VALUES (?)', // Corrected SQL query
            [categoryName]
        );

        res.status(201).json({ message: 'New category added successfully.' });
    } catch (error) {
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
    const { groupName, categoryId } = req.body; // Assuming the front-end sends groupName and categoryId
    try {
        // Step 1: Check if category exists in the database
        const [existingCategory] = await db.query(`
            SELECT * FROM category WHERE category_id = ?
        `, [categoryId]);

        if (!existingCategory.length) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Step 2: Update the category in the database
        await db.query(`
            UPDATE category 
            SET name = ? 
            WHERE category_id = ?
        `, [groupName, categoryId]);

        res.status(200).json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating medicine group:', error);
        res.status(500).json({ message: 'Failed to update medicine group', error });
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