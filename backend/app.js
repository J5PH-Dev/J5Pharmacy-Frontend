const prescriptionRoutes = require('./routes/prescription.routes');
const rfidRoutes = require('./routes/rfid.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// Routes
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/rfid', rfidRoutes);
app.use('/api/dashboard', dashboardRoutes); 