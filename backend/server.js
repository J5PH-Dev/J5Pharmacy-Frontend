const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const { testConnection } = require('./config/database');
const InventoryRoutes = require('./routes/InventoryRoutes'); // Import the inventory routes
const authRoutes = require('./routes/auth.routes'); // Import auth routes
const cashReconciliationRoutes = require('./routes/cashReconciliation.routes');
const transactionRoutes = require('./routes/transaction.routes');
const productRoutes = require('./routes/productRoutes'); // Import product routes
const branchRoutes = require('./routes/branchRoutes'); // Import branch routes
const customerRoutes = require('./routes/customer.routes'); // Import customer routes
const staffRoutes = require('./routes/staff.routes');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'https://pms.j5pharmacy.com'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected');

  // Handle real-time transaction updates
  socket.on('new_transaction', (data) => {
    // Broadcast to all connected clients
    io.emit('transaction_update', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

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
app.use('/api/customers', customerRoutes); // Add customer routes
app.use('/api/staff', staffRoutes);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

