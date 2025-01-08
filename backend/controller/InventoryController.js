const db = require('../config/database').pool; // Import the promisePool from your database configuration
const timeZoneUtil = require('../utils/timeZoneUtil');

// Fetch inventory counts dynamically
exports.getInventoryStats = async (req, res) => {
    try {
        // Get total active products
        const [productsCount] = await db.query(
            'SELECT COUNT(*) as count FROM products WHERE is_active = TRUE'
        );

        // Get total categories
        const [categoriesCount] = await db.query(
            'SELECT COUNT(*) as count FROM category'
        );

        // Get count of products with stock below critical level in any branch
        const [criticalCount] = await db.query(`
            SELECT COUNT(DISTINCT p.id) as count
            FROM products p
            JOIN branch_inventory bi ON p.id = bi.product_id
            WHERE p.is_active = TRUE 
            AND bi.is_active = TRUE
            AND bi.stock <= p.critical
        `);

        res.json({
            productsAvailable: productsCount[0].count,
            medicineGroups: categoriesCount[0].count,
            medicineShortage: criticalCount[0].count
        });
    } catch (error) {
        console.error('Error getting inventory stats:', error);
        res.status(500).json({ message: 'Error getting inventory stats' });
    }
};

// Fetch all available medicines
exports.getMedicineAvailable = async (req, res) => {
    try {
        const { 
            orderBy = 'updatedAt', 
            sortDirection = 'asc',
            createdStartDate,
            createdEndDate,
            updatedStartDate,
            updatedEndDate
        } = req.query;
        
        const validColumns = ['name', 'brand_name', 'barcode', 'category', 'price', 'stock', 'createdAt'];
        const sortColumn = validColumns.includes(orderBy) ? orderBy : 'updatedAt';
        const direction = sortDirection === 'desc' ? 'DESC' : 'ASC';

        // First get all active branches
        const [branches] = await db.query(
            'SELECT branch_id, branch_name FROM branches WHERE is_active = TRUE'
        );

        let query = `
            SELECT p.id as medicineID, p.name, p.brand_name, p.barcode, 
                   c.name as category, p.price,
                   (SELECT COALESCE(SUM(bi.stock), 0)
                    FROM branch_inventory bi 
                    WHERE bi.product_id = p.id AND bi.is_active = TRUE) as stock,
                   ${timeZoneUtil.getConvertTZString('p.createdAt')} as createdAt,
                   ${timeZoneUtil.getConvertTZString('p.updatedAt')} as updatedAt
            FROM products p
            LEFT JOIN category c ON p.category = c.category_id
            WHERE p.is_active = TRUE
        `;

        const queryParams = [];

        // Add date filters if provided
        if (createdStartDate) {
            query += ` AND p.createdAt >= ?`;
            queryParams.push(createdStartDate);
        }
        if (createdEndDate) {
            query += ` AND p.createdAt <= ?`;
            queryParams.push(createdEndDate);
        }
        if (updatedStartDate) {
            query += ` AND p.updatedAt >= ?`;
            queryParams.push(updatedStartDate);
        }
        if (updatedEndDate) {
            query += ` AND p.updatedAt <= ?`;
            queryParams.push(updatedEndDate);
        }

        query += ` ORDER BY ${sortColumn} ${direction}`;

        const [products] = await db.query(query, queryParams);

        // Get branch inventory data for each product
        const productsWithInventory = await Promise.all(products.map(async (product) => {
            // Get inventory for all branches for this product
            const [branchInventory] = await db.query(`
                SELECT 
                    bi.branch_id,
                    bi.stock,
                    bi.expiryDate,
                    b.branch_name
                FROM branch_inventory bi
                JOIN branches b ON bi.branch_id = b.branch_id
                WHERE bi.product_id = ? AND bi.is_active = TRUE
            `, [product.medicineID]);

            // Create an enhanced product object with branch inventory data
            const enhancedProduct = { ...product };
            
            // Add branch-specific data
            branches.forEach(branch => {
                const inventory = branchInventory.find(bi => bi.branch_id === branch.branch_id);
                enhancedProduct[`branch_${branch.branch_id}_stock`] = inventory?.stock?.toString() || '0';
                enhancedProduct[`branch_${branch.branch_id}_expiry`] = inventory?.expiryDate || 'N/A';
            });

            // Also include the raw branch_inventory array for frontend use
            enhancedProduct.branch_inventory = branchInventory;

            return enhancedProduct;
        }));

        res.json(productsWithInventory);
    } catch (error) {
        console.error('Error in getMedicineAvailable:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Add a new medicine
exports.addMedicine = async (req, res) => {
    const { 
        name, brand_name, barcode, category, price, 
        description, sideEffects, requiresPrescription,
        dosage_amount, dosage_unit, pieces_per_box, critical,
        branchInventory // Array of { branchId, stock, expiryDate }
    } = req.body;

    // Validate required fields
    if (!name || !barcode || !category || price === undefined || !description || !sideEffects) {
        return res.status(400).json({ 
            success: false,
            message: 'Required fields are missing',
            missingFields: {
                name: !name,
                barcode: !barcode,
                category: !category,
                price: price === undefined,
                description: !description,
                sideEffects: !sideEffects
            }
        });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        console.log('Starting transaction for adding new medicine');

        // First get the category_id from the category table
        const [categoryResult] = await connection.query(
            'SELECT category_id FROM category WHERE name = ?',
            [category]
        );

        if (!categoryResult || categoryResult.length === 0) {
            await connection.rollback();
            return res.status(400).json({ 
                success: false,
                message: 'Invalid category' 
            });
        }

        const categoryId = categoryResult[0].category_id;
        const currentTimestamp = timeZoneUtil.getMySQLTimestamp();

        console.log('Inserting new medicine with data:', {
            name,
            brand_name,
            barcode,
            categoryId,
            price,
            description,
            sideEffects,
            dosage_amount,
            dosage_unit,
            pieces_per_box,
            critical,
            requiresPrescription
        });

        // Insert the new medicine into the database with timestamps
        const [result] = await connection.query(
            `INSERT INTO products (
                name, brand_name, barcode, category, price, description, 
                sideEffects, requiresPrescription, dosage_amount, dosage_unit,
                pieces_per_box, critical, createdAt, updatedAt, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${currentTimestamp}, ${currentTimestamp}, TRUE)`,
            [
                name, brand_name, barcode, categoryId, price, description, 
                sideEffects, requiresPrescription, dosage_amount, dosage_unit,
                pieces_per_box, critical
            ]
        );

        const productId = result.insertId;
        console.log('Product added with ID:', productId);

        // Get all active branches
        const [branches] = await connection.query(
            'SELECT branch_id FROM branches WHERE is_active = TRUE'
        );

        console.log('Processing branch inventory for branches:', branches);

        // Initialize inventory for all branches
        for (const branch of branches) {
            const branchData = branchInventory?.find(b => b.branchId === branch.branch_id);
            const stock = branchData?.stock || 0;
            const expiryDate = branchData?.expiryDate || null;
            
            console.log('Adding inventory for branch:', {
                branchId: branch.branch_id,
                stock,
                expiryDate
            });

            await connection.query(
                `INSERT INTO branch_inventory 
                (branch_id, product_id, stock, expiryDate, is_active, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, TRUE, NOW(), NOW())`,
                [branch.branch_id, productId, stock, expiryDate]
            );
        }

        await connection.commit();
        console.log('Transaction committed successfully');

        res.status(201).json({ 
            success: true,
            message: 'Product added successfully', 
            productId: productId,
            productName: name
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error adding new product:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false,
                message: 'A product with the same barcode already exists' 
            });
        }

        res.status(500).json({ 
            success: false,
            message: 'Failed to add product', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};


// Fetch all categories dynamically
exports.getCategories = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT category_id, name, prefix FROM category ORDER BY name ASC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories', error });
    }
};


// Delete a medicine based on its barcode
exports.deleteMedicine = async (req, res) => {
    const { barcode } = req.params;  // Barcode passed in the URL

    if (!barcode) {
        return res.status(400).json({ message: 'Barcode is required' });
    }

    try {
        // Delete the medicine from the database using the barcode
        const [result] = await db.query('DELETE FROM products WHERE barcode = ?', [barcode]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        res.status(200).json({ message: 'Medicine deleted successfully' });
    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.status(500).json({ message: 'Failed to delete medicine', error });
    }
};

// Delete multiple medicines based on an array of barcodes
exports.deleteMedicines = async (req, res) => {
    const { barcodes } = req.body;  // Array of barcodes passed in the request body

    if (!barcodes || barcodes.length === 0) {
        return res.status(400).json({ message: 'No barcodes provided' });
    }

    try {
        // Convert barcodes array into a comma-separated string for the SQL query
        const placeholders = barcodes.map(() => '?').join(',');

        // Delete the medicines from the database using the array of barcodes
        const [result] = await db.query(`DELETE FROM products WHERE barcode IN (${placeholders})`, barcodes);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No medicines found for the provided barcodes' });
        }

        res.status(200).json({ message: 'Medicines deleted successfully' });
    } catch (error) {
        console.error('Error deleting medicines:', error);
        res.status(500).json({ message: 'Failed to delete medicines', error });
    }
};


// Fetch medicine details based on medicineName
exports.getMedicineByName = async (req, res) => {
    const { medicineName } = req.params;
    const { branchId } = req.query; // Optional branch ID for branch-specific details
    
    if (!medicineName) {
        return res.status(400).json({ message: 'Medicine barcode is required' });
    }

    try {
        // Get basic product information
        const [product] = await db.query(`
            SELECT 
                p.id,
                p.name,
                COALESCE(p.brand_name, '') as brand_name,
                COALESCE(p.barcode, '') as barcode,
                p.category,
                c.name as category_name,
                COALESCE(p.description, '') as description,
                COALESCE(p.sideEffects, '') as sideEffects,
                COALESCE(p.dosage_amount, 0) as dosage_amount,
                COALESCE(p.dosage_unit, '') as dosage_unit,
                COALESCE(p.price, 0) as price,
                COALESCE(p.pieces_per_box, 0) as pieces_per_box,
                COALESCE(p.expiryDate, NULL) as expiryDate,
                COALESCE(p.requiresPrescription, 0) as requiresPrescription,
                COALESCE(p.critical, 0) as critical,
                p.is_active,
                p.createdAt,
                p.updatedAt
            FROM products p
            LEFT JOIN category c ON p.category = c.category_id
            WHERE p.barcode = ? AND p.is_active = TRUE
        `, [medicineName]);

        if (product.length === 0) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        // Get branch inventory information
        const [branchInventory] = await db.query(`
            SELECT 
                b.branch_id,
                b.branch_name,
                COALESCE(bi.stock, 0) as stock,
                bi.expiryDate,
                COALESCE(bi.createdAt, NOW()) as createdAt,
                COALESCE(bi.updatedAt, NOW()) as updatedAt
            FROM branches b
            LEFT JOIN branch_inventory bi ON b.branch_id = bi.branch_id 
                AND bi.product_id = ? AND bi.is_active = TRUE
            WHERE b.is_active = TRUE
            ORDER BY b.branch_name ASC
        `, [product[0].id]);

        // Calculate total stock from all branches
        const totalStock = branchInventory.reduce((sum, branch) => sum + (branch.stock || 0), 0);

        // Get earliest expiry date across all branches
        const earliestExpiry = branchInventory
            .filter(b => b.expiryDate)
            .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))[0]?.expiryDate || null;

        // Format the response
        const response = {
            medicineInfo: {
                ...product[0],
                price: `₱${parseFloat(product[0].price).toFixed(2)}`,
                total_stock: totalStock,
                earliest_expiry: earliestExpiry
            },
            branchInventory: branchInventory.map(branch => ({
                branch_id: branch.branch_id,
                branch_name: branch.branch_name,
                stock: branch.stock || 0,
                expiryDate: branch.expiryDate || null,
                createdAt: branch.createdAt,
                updatedAt: branch.updatedAt
            }))
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching medicine details:', error);
        res.status(500).json({ message: 'Failed to fetch medicine details', error });
    }
};


// Delete Medicine by name
exports.deleteInEditMedicine = async (req, res) => {
    const { medicineName } = req.params; // Get the medicine name from the URL parameters

    try {
        // SQL query to delete the medicine from the database based on the name
        const deleteQuery = 'DELETE FROM products WHERE name = ?';
        const [deleteResult] = await db.query(deleteQuery, [medicineName]);

        // If no rows were affected, the medicine was not found
        if (deleteResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Medicine not found for deletion' });
        }

        // Return success message upon successful deletion
        res.status(200).json({ message: `Medicine with name ${medicineName} deleted successfully` });
    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.status(500).json({ message: 'Error deleting medicine' });
    }
};



exports.updateMedicineDescription = async (req, res) => {
    const { medicineName } = req.params;
    const {
        name,
        brand_name,
        barcode,
        category,
        price,
        description,
        sideEffects,
        dosage_amount,
        dosage_unit,
        pieces_per_box,
        requiresPrescription
    } = req.body;

    try {
        // Get category_id from category name
        const [categoryResult] = await db.query(
            'SELECT category_id FROM category WHERE name = ?',
            [category]
        );

        if (!categoryResult || categoryResult.length === 0) {
            return res.status(400).json({ message: 'Invalid category' });
        }

        const categoryId = categoryResult[0].category_id;
        const currentTimestamp = timeZoneUtil.getMySQLTimestamp();

        // Update the medicine details
        const [result] = await db.query(
            `UPDATE products 
            SET name = ?, 
                brand_name = ?, 
                barcode = ?, 
                category = ?, 
                price = ?, 
                description = ?, 
                sideEffects = ?, 
                dosage_amount = ?, 
                dosage_unit = ?, 
                pieces_per_box = ?, 
                requiresPrescription = ?,
                updatedAt = ${currentTimestamp}
            WHERE barcode = ?`,
            [
                name,
                brand_name,
                barcode,
                categoryId,
                price,
                description,
                sideEffects,
                dosage_amount,
                dosage_unit,
                pieces_per_box,
                requiresPrescription,
                medicineName
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medicine not found or no changes made.' });
        }

        res.status(200).json({ message: 'Medicine details updated successfully.' });
    } catch (error) {
        console.error('Error updating medicine details:', error);
        res.status(500).json({ message: 'Error updating medicine details', error });
    }
};

// Add new function to get archived products
exports.getArchivedProducts = async (req, res) => {
    try {
        const { orderBy = 'archived_at', sortDirection = 'desc' } = req.query;
        const validColumns = ['name', 'brand_name', 'barcode', 'category', 'archived_at'];
        const timeZoneUtil = require('../utils/timeZoneUtil');
        
        const sortColumn = validColumns.includes(orderBy) ? orderBy : 'archived_at';
        const direction = sortDirection === 'desc' ? 'DESC' : 'ASC';

        // First get the archived products with timezone-adjusted archived_at
        const query = `
          SELECT 
            pa.*,
            c.name as category_name,
            u.name as archived_by_name,
            ${timeZoneUtil.getConvertTZString('pa.archived_at')} as archived_at
          FROM products_archive pa
          LEFT JOIN category c ON pa.category = c.category_id
          LEFT JOIN users u ON pa.archived_by = u.user_id
          ORDER BY ${sortColumn} ${direction}
        `;

        const [products] = await db.query(query);

        // Get branch inventory data for each product
        const productsWithInventory = await Promise.all(products.map(async (product) => {
            const [branchInventory] = await db.query(`
                SELECT 
                    bia.branch_id,
                    bia.stock,
                    bia.expiryDate,
                    b.branch_name
                FROM branch_inventory_archive bia
                JOIN branches b ON bia.branch_id = b.branch_id
                WHERE bia.product_id = ?
                ORDER BY bia.archived_at DESC
            `, [product.product_id]);

            return {
                ...product,
                branch_inventory: branchInventory
            };
        }));

        res.json(productsWithInventory);
    } catch (error) {
        console.error('Error in getArchivedProducts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update delete function to archive instead
exports.archiveProduct = async (req, res) => {
    console.log('Archive request received:', {
        params: req.params,
        body: req.body
    });

    const { barcode } = req.params;
    const { employee_id, userName, reason } = req.body;

    if (!reason) {
        console.log('Archive failed: Missing reason');
        return res.status(400).json({ message: 'Archive reason is required' });
    }

    if (!employee_id) {
        console.log('Archive failed: Missing employee_id');
        return res.status(400).json({ message: 'Employee ID is required' });
    }

    console.log('Starting archive process for:', {
        barcode,
        employee_id,
        reason
    });

    const connection = await db.getConnection();
    console.log('Database connection established');
    
    try {
        await connection.beginTransaction();
        console.log('Transaction started');

        // Get product details and verify it exists and is active
        console.log('Querying product details for barcode:', barcode);
        const [product] = await connection.query(
            'SELECT * FROM products WHERE barcode = ? AND is_active = TRUE FOR UPDATE',
            [barcode]
        );
        console.log('Product query result:', product);

        if (!product || product.length === 0) {
            console.log('Product not found or already archived');
            await connection.rollback();
            return res.status(404).json({ message: 'Product not found or already archived' });
        }

        // Get branch inventory details before archiving
        const [branchInventory] = await connection.query(`
            SELECT bi.*, b.branch_name 
            FROM branch_inventory bi 
            JOIN branches b ON bi.branch_id = b.branch_id 
            WHERE bi.product_id = ? AND bi.is_active = TRUE`,
            [product[0].id]
        );
        console.log('Branch inventory details:', branchInventory);

        // Verify the user exists and get their user_id
        console.log('Verifying employee ID:', employee_id);
        const [user] = await connection.query(
            'SELECT user_id FROM users WHERE employee_id = ?',
            [employee_id]
        );
        console.log('User query result:', user);

        if (!user || user.length === 0) {
            console.log('Invalid employee ID');
            await connection.rollback();
            return res.status(404).json({ message: 'Invalid employee ID' });
        }

        try {
            // Archive branch inventory records
            console.log('Archiving branch inventory records');
            await connection.query(`
                INSERT INTO branch_inventory_archive (
                    branch_id, product_id, stock, expiryDate, 
                    archived_by, archive_reason, archived_at
                )
                SELECT 
                    branch_id, product_id, stock, expiryDate,
                    ?, ?, ${timeZoneUtil.getMySQLTimestamp()}
                FROM branch_inventory
                WHERE product_id = ? AND is_active = TRUE`,
                [employee_id, reason, product[0].id]
            );

            // Deactivate branch inventory records
            await connection.query(
                'UPDATE branch_inventory SET is_active = FALSE WHERE product_id = ?',
                [product[0].id]
            );

            // Insert into products archive with proper timezone
            console.log('Inserting into products_archive');
            const archiveResult = await connection.query(
                `INSERT INTO products_archive (
                    product_id, barcode, name, brand_name, category, description, 
                    sideEffects, dosage_amount, dosage_unit, price, 
                    pieces_per_box, critical, requiresPrescription, expiryDate,
                    archived_by, archive_reason, archived_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${timeZoneUtil.getMySQLTimestamp()})`,
                [
                    product[0].id, product[0].barcode, product[0].name, product[0].brand_name,
                    product[0].category, product[0].description, product[0].sideEffects,
                    product[0].dosage_amount, product[0].dosage_unit, product[0].price,
                    product[0].pieces_per_box, product[0].critical,
                    product[0].requiresPrescription, product[0].expiryDate,
                    user[0].user_id, reason
                ]
            );
            console.log('Archive insert result:', archiveResult);

            // Update product status
            console.log('Updating product status to inactive');
            const updateResult = await connection.query(
                'UPDATE products SET is_active = FALSE, updatedAt = NOW() WHERE barcode = ?',
                [barcode]
            );
            console.log('Product update result:', updateResult);

            await connection.commit();
            console.log('Transaction committed successfully');

            const response = { 
                success: true,
                message: `Product "${product[0].name}" has been archived successfully`,
                productName: product[0].name,
                productId: product[0].id,
                branchInventoryCount: branchInventory.length
            };
            console.log('Sending success response:', response);
            res.json(response);
        } catch (error) {
            console.error('Database error during archive operations:', error);
            await connection.rollback();
            console.log('Transaction rolled back due to database error');
            res.status(500).json({ 
                success: false,
                message: 'Database error while archiving product',
                error: error.message
            });
        }
    } catch (error) {
        console.error('Error in archive process:', error);
        if (connection) {
            await connection.rollback();
            console.log('Transaction rolled back due to error');
        }
        res.status(500).json({ 
            success: false,
            message: 'Failed to archive product',
            error: error.message
        });
    } finally {
        if (connection) {
            connection.release();
            console.log('Database connection released');
        }
    }
};

// Add function to restore archived product
exports.restoreProduct = async (req, res) => {
    const { productId } = req.params;
    const { employee_id, userName } = req.body;

    if (!employee_id) {
        return res.status(400).json({ message: 'Employee ID is required' });
    }
    
    const connection = await db.getConnection();
    console.log('Starting restore process for product ID:', productId);
    
    try {
        await connection.beginTransaction();
        console.log('Transaction started');

        // Verify the user exists
        console.log('Verifying employee ID:', employee_id);
        const [user] = await connection.query(
            'SELECT employee_id FROM users WHERE employee_id = ?',
            [employee_id]
        );
        console.log('User query result:', user);

        if (!user || user.length === 0) {
            console.log('Invalid employee ID');
            await connection.rollback();
            return res.status(404).json({ message: 'Invalid employee ID' });
        }

        // Check if product exists in archive
        const [archived] = await connection.query(
            `SELECT pa.*, c.name as category_name 
             FROM products_archive pa
             LEFT JOIN category c ON pa.category = c.category_id
             WHERE pa.product_id = ?`,
            [productId]
        );
        console.log('Archived product data:', archived[0]);

        if (!archived || archived.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Archived product not found' });
        }

        // Check if product exists and is inactive
        const [existingProduct] = await connection.query(
            'SELECT * FROM products WHERE id = ?',
            [productId]
        );
        console.log('Existing product data:', existingProduct[0]);

        if (!existingProduct || existingProduct.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Product record not found' });
        }

        if (existingProduct[0].is_active) {
            await connection.rollback();
            return res.status(400).json({ message: 'Product is already active' });
        }

        // Get archived branch inventory
        const [archivedInventory] = await connection.query(
            `SELECT bia.*, b.branch_name 
             FROM branch_inventory_archive bia
             JOIN branches b ON bia.branch_id = b.branch_id
             WHERE bia.product_id = ?
             ORDER BY bia.archived_at DESC`,
            [productId]
        );
        console.log('Archived branch inventory data:', archivedInventory);

        // Get all active branches
        const [activeBranches] = await connection.query(
            'SELECT branch_id FROM branches WHERE is_active = TRUE'
        );
        console.log('Active branches:', activeBranches);

        // Restore branch inventory for all active branches
        for (const branch of activeBranches) {
            const archivedBranchData = archivedInventory.find(inv => inv.branch_id === branch.branch_id);
            
            await connection.query(`
                INSERT INTO branch_inventory 
                (branch_id, product_id, stock, expiryDate, is_active, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, TRUE, NOW(), NOW())
                ON DUPLICATE KEY UPDATE 
                stock = VALUES(stock),
                expiryDate = VALUES(expiryDate),
                is_active = TRUE,
                updatedAt = NOW()`,
                [
                    branch.branch_id,
                    productId,
                    archivedBranchData?.stock || 0,
                    archivedBranchData?.expiryDate || null
                ]
            );
            console.log(`Restored inventory for branch ${branch.branch_id}`);
        }

        // Restore product
        await connection.query(
            `UPDATE products SET 
                is_active = TRUE,
                name = ?,
                brand_name = ?,
                barcode = ?,
                category = ?,
                description = ?,
                sideEffects = ?,
                dosage_amount = ?,
                dosage_unit = ?,
                price = ?,
                pieces_per_box = ?,
                critical = ?,
                requiresPrescription = ?,
                expiryDate = ?,
                updatedAt = NOW()
            WHERE id = ?`,
            [
                archived[0].name,
                archived[0].brand_name,
                archived[0].barcode,
                archived[0].category,
                archived[0].description,
                archived[0].sideEffects,
                archived[0].dosage_amount,
                archived[0].dosage_unit,
                archived[0].price,
                archived[0].pieces_per_box,
                archived[0].critical,
                archived[0].requiresPrescription,
                archived[0].expiryDate,
                productId
            ]
        );
        console.log('Product restored to active state');

        // Remove from archives
        await connection.query(
            'DELETE FROM products_archive WHERE product_id = ?',
            [productId]
        );
        console.log('Removed from products_archive');

        await connection.query(
            'DELETE FROM branch_inventory_archive WHERE product_id = ?',
            [productId]
        );
        console.log('Removed from branch_inventory_archive');

        await connection.commit();
        console.log('Restore transaction committed successfully');

        res.json({ 
            success: true,
            message: `Product "${archived[0].name}" has been restored successfully`,
            productName: archived[0].name,
            productId: productId,
            categoryName: archived[0].category_name,
            restoredInventoryCount: archivedInventory.length
        });
    } catch (error) {
        console.error('Error in restore process:', error);
        await connection.rollback();
        res.status(500).json({ 
            success: false,
            message: 'Failed to restore product',
            error: error.message
        });
    } finally {
        connection.release();
        console.log('Database connection released');
    }
};

// Get all branches
exports.getBranches = async (req, res) => {
    try {
        const [branches] = await db.query(
            'SELECT * FROM branches WHERE is_active = TRUE ORDER BY branch_name'
        );
        res.json(branches);
    } catch (error) {
        console.error('Error fetching branches:', error);
        res.status(500).json({ message: 'Failed to fetch branches', error });
    }
};

// Update branch inventory
exports.updateBranchInventory = async (req, res) => {
    const { branchId, productId, stock, expiryDate } = req.body;

    if (!branchId || !productId || stock === undefined) {
        return res.status(400).json({ message: 'Branch ID, Product ID, and stock are required' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Check if inventory record exists
        const [existing] = await connection.query(
            'SELECT * FROM branch_inventory WHERE branch_id = ? AND product_id = ? AND is_active = TRUE',
            [branchId, productId]
        );

        if (existing.length > 0) {
            // Update existing record
            await connection.query(
                'UPDATE branch_inventory SET stock = ?, expiryDate = ?, updatedAt = NOW() WHERE branch_id = ? AND product_id = ?',
                [stock, expiryDate, branchId, productId]
            );
        } else {
            // Create new record
            await connection.query(
                'INSERT INTO branch_inventory (branch_id, product_id, stock, expiryDate) VALUES (?, ?, ?, ?)',
                [branchId, productId, stock, expiryDate]
            );
        }

        await connection.commit();
        res.json({ message: 'Branch inventory updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating branch inventory:', error);
        res.status(500).json({ message: 'Failed to update branch inventory', error });
    } finally {
        connection.release();
    }
};

exports.getCriticalProducts = async (req, res) => {
    try {
        const timeZoneUtil = require('../utils/timeZoneUtil');
        
        // Get products with stock below critical level in any branch
        const [products] = await db.query(`
            SELECT DISTINCT
                p.id,
                p.name,
                p.brand_name,
                p.barcode,
                p.category,
                c.name as category_name,
                p.critical,
                p.price,
                p.createdAt,
                p.updatedAt,
                ${timeZoneUtil.getConvertTZString('p.createdAt')} as created_at,
                ${timeZoneUtil.getConvertTZString('p.updatedAt')} as updated_at
            FROM products p
            JOIN branch_inventory bi ON p.id = bi.product_id
            LEFT JOIN category c ON p.category = c.category_id
            WHERE p.is_active = TRUE 
            AND bi.is_active = TRUE
            AND bi.stock <= p.critical
            GROUP BY p.id
        `);

        // Get branch inventory for each product
        const productsWithInventory = await Promise.all(products.map(async (product) => {
            const [branchInventory] = await db.query(`
                SELECT 
                    bi.branch_id,
                    bi.stock,
                    bi.expiryDate,
                    b.branch_name
                FROM branch_inventory bi
                JOIN branches b ON bi.branch_id = b.branch_id
                WHERE bi.product_id = ? AND bi.is_active = TRUE
            `, [product.id]);

            return {
                ...product,
                branch_inventory: branchInventory
            };
        }));

        res.json(productsWithInventory);
    } catch (error) {
        console.error('Error getting critical products:', error);
        res.status(500).json({ message: 'Error getting critical products' });
    }
};

// Archive a category
exports.archiveCategory = async (req, res) => {
    const { categoryId } = req.params;
    const { archivedBy } = req.body;

    if (!categoryId || !archivedBy) {
        return res.status(400).json({ message: 'Category ID and user ID are required' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Get category details before archiving
        const [category] = await connection.query(
            'SELECT * FROM category WHERE category_id = ?',
            [categoryId]
        );

        if (category.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Category not found' });
        }

        // Insert into category_archive
        await connection.query(
            `INSERT INTO category_archive (
                category_id, name, prefix, archived_by, archived_at
            ) VALUES (?, ?, ?, ?, ${timeZoneUtil.getMySQLTimestamp()})`,
            [categoryId, category[0].name, category[0].prefix, archivedBy]
        );

        // Update products to set category to NULL
        await connection.query(
            'UPDATE products SET category = NULL WHERE category = ?',
            [categoryId]
        );

        // Delete from category table
        await connection.query(
            'DELETE FROM category WHERE category_id = ?',
            [categoryId]
        );

        await connection.commit();
        res.json({ message: 'Category archived successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error archiving category:', error);
        res.status(500).json({ message: 'Failed to archive category' });
    } finally {
        connection.release();
    }
};

// Get archived categories
exports.getArchivedCategories = async (req, res) => {
    try {
        const query = `
            SELECT 
                ca.*,
                u.name as archived_by_name,
                ${timeZoneUtil.getConvertTZString('ca.archived_at')} as archived_at
            FROM category_archive ca
            LEFT JOIN users u ON ca.archived_by = u.user_id
            ORDER BY ca.archived_at DESC
        `;

        const [categories] = await db.query(query);
        res.json(categories);
    } catch (error) {
        console.error('Error getting archived categories:', error);
        res.status(500).json({ message: 'Failed to get archived categories' });
    }
};

// Restore archived category
exports.restoreCategory = async (req, res) => {
    const { categoryId } = req.params;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Get archived category details
        const [archivedCategory] = await connection.query(
            'SELECT * FROM category_archive WHERE category_id = ?',
            [categoryId]
        );

        if (archivedCategory.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Archived category not found' });
        }

        // Insert back into category table
        await connection.query(
            'INSERT INTO category (category_id, name, prefix) VALUES (?, ?, ?)',
            [categoryId, archivedCategory[0].name, archivedCategory[0].prefix]
        );

        // Delete from archive
        await connection.query(
            'DELETE FROM category_archive WHERE category_id = ?',
            [categoryId]
        );

        await connection.commit();
        res.json({ message: 'Category restored successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error restoring category:', error);
        res.status(500).json({ message: 'Failed to restore category' });
    } finally {
        connection.release();
    }
};

// Restore a product from archive
exports.restoreProduct = async (req, res) => {
    const { barcode } = req.params;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Get product details from products_archive
        const [archivedProduct] = await connection.query(
            'SELECT * FROM products_archive WHERE product_id = ?',
            [barcode]
        );

        if (archivedProduct.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Archived product not found' });
        }

        // Update the product in products table
        await connection.query(
            'UPDATE products SET is_active = 0 WHERE id = ?',
            [barcode]
        );

        // Delete from products_archive
        await connection.query(
            'DELETE FROM products_archive WHERE product_id = ?',
            [barcode]
        );

        await connection.commit();
        res.json({ message: 'Product restored successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error restoring product:', error);
        res.status(500).json({ message: 'Failed to restore product', error });
    } finally {
        connection.release();
    }
};
