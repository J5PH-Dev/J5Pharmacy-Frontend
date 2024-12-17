// Import the promisePool from database.js
const db = require('../config/database').pool; // Using the pool created in database.js

// Fetch sales data from the database
exports.getSalesData = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM sales'); // Adjust the query to match your database schema
        res.status(200).json(rows); // Return the sales data as a JSON response
    } catch (error) {
        // Handle any errors that occur during the database query
        console.error('Error fetching sales data:', error);
        res.status(500).json({ message: 'Failed to fetch sales data', error });
    }
};
