import React from 'react';
import { Box, Typography, Button, Paper, Divider } from '@mui/material';

interface BranchInventoryPrint {
    branch_name: string;
    stock: number;
    expiryDate: string | null;
}

interface Medicine {
    name: string;
    brand_name: string;
    barcode: string;
    category: string;
    price: string;
    description: string;
    sideEffects: string;
    dosage: string;
    pieces_per_box: number;
    requiresPrescription: boolean;
    branchInventory: BranchInventoryPrint[];
}

export interface MedicinePrintViewProps {
    medicineData: Medicine;
}

const MedicinePrintView: React.FC<MedicinePrintViewProps> = ({ medicineData }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <Box>
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #print-content, #print-content * {
                            visibility: visible;
                        }
                        #print-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        @page {
                            size: A4;
                            margin: 15mm;
                        }
                        .print-header {
                            margin-bottom: 20px;
                        }
                        .print-section {
                            margin-bottom: 15px;
                        }
                    }
                `}
            </style>
            <Button 
                variant="contained" 
                onClick={handlePrint}
                sx={{ 
                    mb: 2,
                    '@media print': {
                        display: 'none'
                    }
                }}
            >
                Print this page
            </Button>
            <Paper 
                id="print-content"
                sx={{ 
                    p: 4,
                    '@media print': {
                        p: 2,
                        boxShadow: 'none',
                        margin: 0
                    }
                }}
            >
                {/* Pharmacy Header */}
                <Box sx={{ textAlign: 'center', mb: 3 }} className="print-header">
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        J5 Pharmacy
                    </Typography>
                    <Typography variant="subtitle1">
                        Phase 1, Bagong Silang, Caloocan City
                    </Typography>
                    <Typography variant="subtitle2">
                        Contact: 0966-775-1474
                    </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Medicine Name Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {medicineData.name}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        {medicineData.brand_name}
                    </Typography>
                </Box>

                {/* Basic Information */}
                <Box sx={{ mb: 4 }} className="print-section">
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                        Medicine Information
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, pl: 2 }}>
                        <Typography><strong>Category:</strong> {medicineData.category}</Typography>
                        <Typography><strong>Dosage:</strong> {medicineData.dosage}</Typography>
                        <Typography><strong>Price:</strong> {medicineData.price}</Typography>
                        <Typography><strong>Pieces per Box:</strong> {medicineData.pieces_per_box}</Typography>
                        {medicineData.requiresPrescription && (
                            <Typography sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                                * Requires Prescription
                            </Typography>
                        )}
                    </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* How to Use */}
                <Box sx={{ mb: 4 }} className="print-section">
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                        How to Use
                    </Typography>
                    <Typography paragraph sx={{ whiteSpace: 'pre-line', pl: 2 }}>
                        {medicineData.description}
                    </Typography>
                </Box>

                {/* Side Effects */}
                <Box sx={{ mb: 4 }} className="print-section">
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                        Side Effects
                    </Typography>
                    <Typography paragraph sx={{ whiteSpace: 'pre-line', pl: 2 }}>
                        {medicineData.sideEffects}
                    </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
                        This document is for information purposes only.
                        Please consult with a healthcare professional before use.
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        Printed on: {new Date().toLocaleString()}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default MedicinePrintView; 