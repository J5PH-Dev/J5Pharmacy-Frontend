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
const branchRoutes = require('./routes/branchRoutes'); // Import branch routes
const customerRoutes = require('./routes/customer.routes'); // Import customer routes
const staffRoutes = require('./routes/staff.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const resourcesRoutes = require('./routes/resources.routes');
// const posProductRoutes = require('./routes/pos/pos.product.routes');
// const posTransactionRoutes = require('./routes/pos/pos.transaction.routes');
// const posSessionRoutes = require('./routes/pos/pos.session.routes');
// const posInventoryRoutes = require('./routes/pos/pos.inventory.routes');
// const posCustomerRoutes = require('./routes/pos/pos.customer.routes');
const { initializeSocket } = require('./socket');
// Import dev routes
const devRoutes = require('./routes/dev.routes');

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
  const clientIP = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  console.log(`Client connected from IP: ${clientIP}`);

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
app.use('/api/admin', branchRoutes); // Add branch routes
app.use('/api/customers', customerRoutes); // Add customer routes
app.use('/api/staff', staffRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/resources', resourcesRoutes);
// app.use('/api/pos/products', posProductRoutes);
// app.use('/api/pos/transactions', posTransactionRoutes);
// app.use('/api/pos/sessions', posSessionRoutes);
// app.use('/api/pos/inventory', posInventoryRoutes);
// app.use('/api/pos/customers', posCustomerRoutes);

// Register dev routes
if (process.env.NODE_ENV === 'development') {
    app.use('/api/dev', devRoutes);
    console.log('[DEV] Development routes enabled');
}

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize Socket.io
initializeSocket(httpServer);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

