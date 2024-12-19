const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const { testConnection } = require('./config/database');
const InventoryRoutes = require('./routes/InventoryRoutes'); // Import the inventory routes
const authRoutes = require('./routes/auth.routes'); // Import auth routes

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000', // The React app is running on localhost:3000
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers for the request
  credentials: true, // Allows cookies and authorization headers
};

// Middleware
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // Enable CORS with the specified options
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to J5 Pharmacy Management System API' });
});

// Test database connection
testConnection();

// Routes
app.use('/api/auth', authRoutes); // Add auth routes
app.use('/', InventoryRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

