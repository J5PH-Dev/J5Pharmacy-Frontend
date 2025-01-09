const db = require('../config/database');
const { getConvertTZString, getMySQLTimestamp } = require('../utils/timeZoneUtil');

// Create new prescription with image
const createPrescription = async (req, res) => {
    try {
        const {
            customer_id,
            doctor_name,
            doctor_license_number,
            prescription_date,
            expiry_date,
            notes,
            items
        } = req.body;

        // Validate required fields
        if (!customer_id || !doctor_name || !doctor_license_number || !prescription_date || !expiry_date) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Start transaction
        const connection = await db.pool.getConnection();
        await connection.beginTransaction();

        try {
            // Insert prescription
            const [result] = await connection.query(
                `INSERT INTO prescriptions (
                    customer_id, doctor_name, doctor_license_number,
                    prescription_date, expiry_date, notes,
                    image_data, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ${getMySQLTimestamp()}, ${getMySQLTimestamp()})`,
                [
                    customer_id,
                    doctor_name,
                    doctor_license_number,
                    prescription_date,
                    expiry_date,
                    notes,
                    req.file ? req.file.buffer : null
                ]
            );

            const prescription_id = result.insertId;

            // Insert prescription items if provided
            if (items && Array.isArray(items)) {
                for (const item of items) {
                    await connection.query(
                        `INSERT INTO prescription_items (
                            prescription_id, product_id,
                            prescribed_quantity, dispensed_quantity,
                            dosage_instructions
                        ) VALUES (?, ?, ?, ?, ?)`,
                        [
                            prescription_id,
                            item.product_id,
                            item.prescribed_quantity,
                            0, // Initial dispensed quantity is 0
                            item.dosage_instructions
                        ]
                    );
                }
            }

            await connection.commit();

            // Get the created prescription with converted timestamps
            const [prescriptions] = await db.pool.query(
                `SELECT 
                    p.prescription_id,
                    p.doctor_name,
                    p.doctor_license_number,
                    DATE(${getConvertTZString('p.prescription_date')}) as prescription_date,
                    DATE(${getConvertTZString('p.expiry_date')}) as expiry_date,
                    p.notes,
                    p.status,
                    ${getConvertTZString('p.created_at')} as created_at,
                    ${getConvertTZString('p.updated_at')} as updated_at
                 FROM prescriptions p
                 WHERE p.prescription_id = ?`,
                [prescription_id]
            );

            res.status(201).json({
                success: true,
                message: 'Prescription created successfully',
                data: prescriptions[0]
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error creating prescription:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating prescription',
            error: error.message
        });
    }
};

// Update prescription image
const updatePrescriptionImage = async (req, res) => {
    try {
        const { prescription_id } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        // Update prescription image
        await db.pool.query(
            `UPDATE prescriptions 
             SET image_data = ?,
                 updated_at = ${getMySQLTimestamp()}
             WHERE prescription_id = ?`,
            [req.file.buffer, prescription_id]
        );

        res.json({
            success: true,
            message: 'Prescription image updated successfully'
        });
    } catch (error) {
        console.error('Error updating prescription image:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating prescription image',
            error: error.message
        });
    }
};

// Get prescription image
const getPrescriptionImage = async (req, res) => {
    try {
        const { prescription_id } = req.params;

        // Get prescription image
        const [prescriptions] = await db.pool.query(
            'SELECT image_data FROM prescriptions WHERE prescription_id = ?',
            [prescription_id]
        );

        if (prescriptions.length === 0 || !prescriptions[0].image_data) {
            return res.status(404).json({
                success: false,
                message: 'Prescription image not found'
            });
        }

        // Set response headers
        res.setHeader('Content-Type', 'image/png');
        res.send(prescriptions[0].image_data);
    } catch (error) {
        console.error('Error getting prescription image:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting prescription image',
            error: error.message
        });
    }
};

module.exports = {
    createPrescription,
    updatePrescriptionImage,
    getPrescriptionImage
}; 