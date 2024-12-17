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
        // Query to get specific columns: name, barcode, category, and stock
        const [rows] = await db.query('SELECT name, barcode, category, price, stock FROM products');
        res.status(200).json(rows); // Send the data back to the frontend
    } catch (error) {
        console.error('Error fetching data from database:', error);
        res.status(500).json({ message: 'Error fetching data' });
    }
};

// Add a new medicine
exports.addMedicine = async (req, res) => {
    const { name, barcode, category, price, stock, description, sideEffects, requiresPrescription } = req.body;

    // Validate that all required fields are present
    if (!name || !barcode || !category || !price || !stock || !description || !sideEffects || requiresPrescription === undefined) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const [result] = await db.query(`
            INSERT INTO products (name, barcode, category, price, stock, description, sideEffects, requiresPrescription)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, barcode, category, price, stock, description, sideEffects, requiresPrescription]);

        res.status(201).json({ message: 'Medicine added successfully', insertId: result.insertId });
    } catch (error) {
        console.error('Error adding new medicine:', error);
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