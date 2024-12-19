const db = require('../config/database').pool; // Import the promisePool from your database configuration

// Fetch inventory counts dynamically
exports.getInventoryStats = async (req, res) => {
    try {
        // Use the promise-based query method
        const [rows] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM products) AS medicinesAvailable,
        (SELECT COUNT(*) FROM category) AS medicineGroups,
        (SELECT COUNT(*) FROM products WHERE stock < 50) AS medicineShortage
    `);

        const stats = rows[0]; // The first row in the result is the actual data
        res.status(200).json({
            medicinesAvailable: stats.medicinesAvailable || 0,
            medicineGroups: stats.medicineGroups || 0,
            medicineShortage: stats.medicineShortage || 0,
        });
    } catch (error) {
        console.error('Error fetching inventory stats:', error);
        res.status(500).json({ message: 'Failed to fetch inventory stats', error });
    }
};

// Fetch all available medicines
exports.getMedicineAvailable = async (req, res) => {
    try {
        // Category mapping
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

        // Query to get specific columns: name, barcode, category, and stock
        const [rows] = await db.query('SELECT name, barcode, category, price, stock FROM products');

        // Map category IDs to their names
        const updatedRows = rows.map(row => ({
            ...row,
            category: categoryMap[row.category] || 'UNKNOWN', // Fallback to 'UNKNOWN' if ID is not mapped
        }));

        res.status(200).json(updatedRows); // Send the updated data back to the frontend
    } catch (error) {
        console.error('Error fetching data from database:', error);
        res.status(500).json({ message: 'Error fetching data' });
    }
};


// Add a new medicine
exports.addMedicine = async (req, res) => {
    const { name, barcode, category, price, stock, description, sideEffects, requiresPrescription } = req.body;

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

    // Validate required fields
    if (!name || !barcode || !category || price === undefined || stock === undefined || !description || !sideEffects || requiresPrescription === undefined) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Map category name to category number
    const categoryNumber = categoryMapping[category];

    // Check if the category is valid
    if (!categoryNumber) {
        return res.status(400).json({ message: 'Invalid category' });
    }

    try {
        // Insert the new medicine into the database
        const [result] = await db.query(
            `INSERT INTO products (name, barcode, category, price, stock, description, sideEffects, requiresPrescription) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, barcode, categoryNumber, price, stock, description, sideEffects, requiresPrescription]
        );

        res.status(201).json({ message: 'Medicine added successfully', insertId: result.insertId });
    } catch (error) {
        console.error('Error adding new medicine:', error);

        // Check for specific MySQL errors like duplicate entry
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'A medicine with the same barcode already exists' });
        }

        res.status(500).json({ message: 'Failed to add medicine', error });
    }
};


// Fetch all categories dynamically
exports.getCategories = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT DISTINCT name FROM category ORDER BY name ASC');
        res.status(200).json(rows.map(row => row.name)); // Ensure only strings are sent
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
    // Define a mapping for category values
    const categoryMapping = {
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

    const { medicineName } = req.params;
    const decodedMedicineName = decodeURIComponent(medicineName.trim()); // Properly decode spaces

    if (!decodedMedicineName) {
        return res.status(400).json({ message: 'Medicine name is required' });
    }

    try {
        const [result] = await db.query('SELECT * FROM products WHERE name = ?', [decodedMedicineName]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        const medicine = result[0];

        // Map category number to category text
        medicine.category = categoryMapping[medicine.category] || 'Unknown Category'; // Update the category field with text

        // Respond with the modified medicine object
        res.status(200).json({
            data: medicine, // Send back the updated medicine object
        });
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
    const {
        name,
        barcode,
        instructions,
        sideEffects,
        brand_name,
        price,
        stock,
        dosage_amount,
        dosage_unit,
        pieces_per_box,
        expiryDate,
        requiresPrescription,
        group, // Category name
    } = req.body;

    // Category to number mapping
    const categoryMap = {
        'BRANDED': 1,
        'GENERIC': 2,
        'COSMETICS': 3,
        'DIAPER': 4,
        'FACE AND BODY': 5,
        'GALENICALS': 6,
        'MILK': 7,
        'PILLS AND CONTRACEPTIVES': 8,
        'SYRUP': 9,
        'OTHERS': 10
    };

    // Validate required fields
    if (!name || !barcode || !price || !stock || !group) {
        return res.status(400).json({ message: 'Required fields are missing.' });
    }

    // Map category name to corresponding number
    const categoryNumber = categoryMap[group.toUpperCase()];

    if (!categoryNumber) {
        return res.status(400).json({ message: 'Invalid category.' });
    }

    const updateQuery = `
        UPDATE products
        SET
            name = ?,
            barcode = ?,
            description = ?,
            sideEffects = ?,
            brand_name = ?,
            price = ?,
            stock = ?,
            dosage_amount = ?,
            dosage_unit = ?,
            pieces_per_box = ?,
            expiryDate = ?,
            requiresPrescription = ?,
            category = ?  // Store the numeric value for category
        WHERE name = ?`;

    const values = [
        name,
        barcode,
        instructions,
        sideEffects,
        brand_name,
        price,
        stock,
        dosage_amount,
        dosage_unit,
        pieces_per_box,
        expiryDate,
        requiresPrescription,
        categoryNumber, // Use the numeric value for the category
        name, // Ensure this matches the WHERE condition
    ];

    try {
        const [result] = await db.query(updateQuery, values);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Medicine details updated successfully.' });
        } else {
            res.status(404).json({ message: 'Medicine not found or no changes made.' });
        }
    } catch (error) {
        console.error('Error updating medicine details:', error);
        res.status(500).json({ message: 'Error updating medicine details', error });
    }
};
