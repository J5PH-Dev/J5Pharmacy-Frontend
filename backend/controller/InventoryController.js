const db = require('../config/database').pool; // Import the promisePool from your database configuration

// Fetch inventory counts dynamically
exports.getInventoryStats = async (req, res) => {
    try {
        // Use the promise-based query method
        const [rows] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM products) AS medicinesAvailable,
        (SELECT COUNT(*) FROM group_categories) AS medicineGroups,
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
        const [rows] = await db.query('SELECT name, barcode, category, stock FROM products');
        res.status(200).json(rows); // Send the data back to the frontend
    } catch (error) {
        console.error('Error fetching data from database:', error);
        res.status(500).json({ message: 'Error fetching data' });
    }
};