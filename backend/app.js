const prescriptionRoutes = require('./routes/prescription.routes');
const rfidRoutes = require('./routes/rfid.routes');

// Routes
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/rfid', rfidRoutes); 