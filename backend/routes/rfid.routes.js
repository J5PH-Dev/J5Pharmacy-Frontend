const express = require('express');
const router = express.Router();

// Mock RFID scanning - in production, this would interface with your RFID hardware
router.get('/scan', async (req, res) => {
    try {
        // Simulate RFID scanning delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate a random card ID for testing
        // In production, this would come from your RFID reader
        const cardId = 'RFID_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        res.json({
            success: true,
            card_id: cardId,
            message: 'Card scanned successfully'
        });
    } catch (error) {
        console.error('Error scanning RFID card:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to scan RFID card'
        });
    }
});

module.exports = router; 