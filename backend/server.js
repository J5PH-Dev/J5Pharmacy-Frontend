const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const { testConnection } = require('./config/database');
const InventoryRoutes = require('./routes/InventoryRoutes'); // Import the inventory routes
const authRoutes = require('./routes/auth.routes'); // Import auth routes
const cashReconciliationRoutes = require('./routes/cashReconciliation.routes');
const transactionRoutes = require('./routes/transaction.routes');
const productRoutes = require('./routes/productRoutes'); // Import product routes
const branchRoutes = require('./routes/branchRoutes'); // Import branch routes

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'https://pms.j5pharmacy.com'], // Allow both localhost and production URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
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
app.use('/api/cash-reconciliation', cashReconciliationRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/products', productRoutes); // Add product routes
app.use('/api/admin', branchRoutes); // Add branch routes

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

