import React, { useState, useEffect } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack, TextField, InputAdornment, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Alert, Autocomplete, Checkbox, FormControlLabel, Card, CardActionArea, CardMedia, CardContent, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import { useLocation, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import CheckIcon from '@mui/icons-material/Check';
import axios from 'axios';
import MedicinePrintView from './MedicinePrintView';

interface MedicineDetails {
    medicineInfo: {
        id: number;
        barcode: string;
        name: string;
        brand_name: string;
        category_name: string;
        description: string;
        sideEffects: string;
        dosage_amount: number;
        dosage_unit: string;
        price: string;
        total_stock: number;
        pieces_per_box: number;
        expiryDate: string;
        requiresPrescription: number;
        earliest_expiry: string | null;
        createdAt: string;
        updatedAt: string;
        critical: number;
    };
    branchInventory: BranchInventory[];
}

interface BranchInventory {
    branch_id: number;
    branch_name: string;
    stock: number;
    expiryDate: string | null;
    createdAt: string;
    updatedAt: string;
}

const ViewMedicineDescription = () => {
    const navigate = useNavigate();
    const { medicineName } = useParams<{ medicineName: string }>();
    const [openDialog, setOpenDialog] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openBranchesModal, setOpenBranchesModal] = useState(false);
    const location = useLocation();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(location.state?.successMessage || null);
    const [medicineDetails, setMedicineDetails] = useState<MedicineDetails | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [editStock, setEditStock] = useState<number>(0);
    const [editExpiryDate, setEditExpiryDate] = useState<string>('');
    const [openPrintDialog, setOpenPrintDialog] = useState(false);

    useEffect(() => {
        if (successMessage) {
            const timeout = setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [successMessage]);

    useEffect(() => {
        const fetchMedicineDetails = async () => {
            if (!medicineName) {
                setErrorMessage('No medicine specified');
                return;
            }

            try {
                console.log('Fetching details for barcode:', medicineName);
                const response = await axios.get(`/admin/inventory/view-medicines-description/${medicineName}`);
                console.log('Medicine details response:', response.data);
                if (response.data) {
                    setMedicineDetails(response.data);
                    setErrorMessage(null);
                } else {
                    setErrorMessage('Medicine not found');
                }
            } catch (error) {
                console.error('Error fetching medicine details:', error);
                setErrorMessage('Failed to load medicine details. Please try again.');
            }
        };

        fetchMedicineDetails();
    }, [medicineName]);

    const handleBreadcrumbClick = (path: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(path);
    };

    const handleEditItemClick = () => {
        navigate(`/manager/inventory/view-medicines-description/${medicineName}/edit-details`);
    };

    const handleEditInventory = (branchId: number, currentStock: number, currentExpiryDate: string | null) => {
        setSelectedBranch(branchId);
        setEditStock(currentStock);
        setEditExpiryDate(currentExpiryDate || '');
        setOpenEditModal(true);
    };

    const handleSaveInventory = async () => {
        if (!selectedBranch || !medicineDetails || !medicineName) return;

        try {
            await axios.post('/admin/inventory/update-branch-inventory', {
                branchId: selectedBranch,
                productId: medicineDetails.medicineInfo.id,
                stock: editStock,
                expiryDate: editExpiryDate || null
            });

            setSuccessMessage('Inventory updated successfully');
            setOpenEditModal(false);
            setOpenBranchesModal(false);

            // Refresh medicine details
            const response = await axios.get(`/admin/inventory/view-medicines-description/${medicineName}`);
            
            if (response.data) {
                setMedicineDetails(response.data);
            }
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Error updating inventory');
        }
    };

    const handlePrint = () => {
        setOpenPrintDialog(true);
    };

    const handlePrintClose = () => {
        setOpenPrintDialog(false);
    };

    // Function to get display name
    const getDisplayName = () => {
        if (!medicineDetails) return 'Loading...';
        return medicineDetails.medicineInfo.brand_name ? 
            `${medicineDetails.medicineInfo.name} (${medicineDetails.medicineInfo.brand_name})` : 
            medicineDetails.medicineInfo.name;
    };

    if (!medicineDetails) {
        return <Box sx={{ p: 0, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>Loading...</Box>;
    }

    return (
        <Box sx={{ p: 0, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>
            {/* Success/Error Messages */}
            {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
            )}
            {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                    variant="contained"
                    onClick={handleEditItemClick}
                    sx={{
                        backgroundColor: '#01A768',
                        color: '#fff',
                        padding: '8px 16px',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        '&:hover': {
                            backgroundColor: '#017F4A',
                        },
                    }}
                    startIcon={<EditIcon />}
                >
                    Edit Details
                </Button>
                <Button
                    variant="contained"
                    onClick={handlePrint}
                    sx={{
                        backgroundColor: '#2196F3',
                        color: '#fff',
                        padding: '8px 16px',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        '&:hover': {
                            backgroundColor: '#1976D2',
                        },
                    }}
                    startIcon={<PrintIcon />}
                >
                    Print Details
                </Button>
            </Box>

            {/* Content Section */}
            <div className='flex flex-row flex-wrap gap-5'>
                {/* Medicine Info Box */}
                <Box
                    sx={{
                        width: '900px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    {/* Header */}
                    <Box sx={{ padding: '17px 30px', textAlign: 'left' }}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>Medicine Information</Typography>
                    </Box>
                    <Divider />
                    {/* Content */}
                    <Box sx={{ padding: '21px 30px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                        {/* Product Name */}
                        <Box sx={{ flex: '1 1 30%' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                {medicineDetails.medicineInfo.name}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Product Name</Typography>
                        </Box>

                        {/* Product Barcode */}
                        <Box sx={{ flex: '1 1 30%' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                {medicineDetails.medicineInfo.barcode}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Product Barcode</Typography>
                        </Box>
                        
                        {/* Category */}
                        <Box sx={{ flex: '1 1 30%' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                {medicineDetails.medicineInfo.category_name}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Category</Typography>
                        </Box>

                        {/* Brand Name */}
                        <Box sx={{ flex: '1 1 30%' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                {medicineDetails.medicineInfo.brand_name}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Brand Name</Typography>
                        </Box>
                        
                        {/* Price */}
                        <Box sx={{ flex: '1 1 30%' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                {medicineDetails.medicineInfo.price}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Price</Typography>
                        </Box>
                        
                        {/* Stock */}
                        <Box sx={{ flex: '1 1 30%' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                {medicineDetails.medicineInfo.total_stock}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Stock Available</Typography>
                        </Box>

                        {/* Stock Warning Level */}
                        <Box sx={{ flex: '1 1 30%' }}>
                            <Typography 
                                sx={{ 
                                    fontWeight: 'bold', 
                                    fontSize: '19px',
                                    color: medicineDetails.medicineInfo.total_stock <= medicineDetails.medicineInfo.critical ? '#ff4444' : 'inherit'
                                }}
                            >
                                {medicineDetails.medicineInfo.critical}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Stock Warning Level</Typography>
                        </Box>
                        
                        {/* Dosage */}
                        <Box sx={{ flex: '1 1 30%' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                {medicineDetails.medicineInfo.dosage_amount} {medicineDetails.medicineInfo.dosage_unit}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Dosage</Typography>
                        </Box>
                        
                        {/* Pieces Per Box */}
                        <Box sx={{ flex: '1 1 30%' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                {medicineDetails.medicineInfo.pieces_per_box}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Pieces Per Box</Typography>
                        </Box>
                        
                        {/* Expiry Date */}
                        <Box sx={{ flex: '1 1 30%' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                {medicineDetails.medicineInfo.earliest_expiry ? 
                                    new Date(medicineDetails.medicineInfo.earliest_expiry).toLocaleDateString() : 
                                    'N/A'}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Earliest Expiry Date</Typography>
                        </Box>

                        {/* Requires Prescription */}
                        <Box sx={{ flex: '1 1 30%' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                {medicineDetails.medicineInfo.requiresPrescription === 1 ? 'Yes' : 'No'}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Requires Prescription</Typography>
                        </Box>

                        {/* Created At */}
                        <Box sx={{ flex: '1 1 30%' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                {medicineDetails.medicineInfo.createdAt ? 
                                    new Date(medicineDetails.medicineInfo.createdAt).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : 'N/A'}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Created At</Typography>
                        </Box>

                        {/* Updated At */}
                        <Box sx={{ flex: '1 1 30%' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                {medicineDetails.medicineInfo.updatedAt ? 
                                    new Date(medicineDetails.medicineInfo.updatedAt).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : 'N/A'}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Updated At</Typography>
                        </Box>
                    </Box>
                </Box>
                
                {/* Branch Inventory */}
                <Box
                    sx={{
                        width: '500px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    {/* Header */}
                    <div className="flex flex-row justify-between items-center">
                        <Box sx={{ padding: '14px 30px', textAlign: 'left' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                Branch Inventory
                                <Typography component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '15px' }}>
                                    ({medicineDetails.branchInventory.length} {medicineDetails.branchInventory.length === 1 ? 'Branch' : 'Branches'})
                                </Typography>
                            </Typography>
                        </Box>
                        <Box sx={{ padding: '14px 30px', textAlign: 'left' }}>
                            <IconButton onClick={() => setOpenBranchesModal(true)}>
                                <EditIcon sx={{ fontSize: '19px', color: 'gray' }} />
                            </IconButton>
                        </Box>
                    </div>
                    <Divider />
                    {/* Content Section with Scroll */}
                    <Box sx={{ 
                        maxHeight: '300px', 
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: '#f1f1f1',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: '#888',
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            background: '#555',
                        },
                    }}>
                        {medicineDetails.branchInventory.map((branch) => (
                            <Box 
                                key={branch.branch_id} 
                                sx={{ 
                                    padding: '21px 30px', 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    borderBottom: '1px solid #f0f0f0',
                                    '&:last-child': {
                                        borderBottom: 'none'
                                    }
                                }}
                            >
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>{branch.stock}</Typography>
                                    <Typography sx={{ color: 'black', fontSize: '15px' }}>{branch.branch_name}</Typography>
                                    <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>
                                        Expires: {branch.expiryDate ? new Date(branch.expiryDate).toLocaleDateString() : 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Instructions */}
                <Box
                    sx={{
                        width: '700px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <Box sx={{ padding: '19px 30px', textAlign: 'left' }}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>How to use</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ padding: '21px 30px' }}>
                        <Typography sx={{ color: 'black', fontSize: '15px' }}>{medicineDetails.medicineInfo.description || 'No instructions available'}</Typography>
                    </Box>
                </Box>

                {/* Side Effects */}
                <Box
                    sx={{
                        width: '700px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <Box sx={{ padding: '19px 30px', textAlign: 'left' }}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>Side Effects</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ padding: '21px 30px' }}>
                        <Typography sx={{ color: 'black', fontSize: '15px' }}>{medicineDetails.medicineInfo.sideEffects || 'No side effects listed'}</Typography>
                    </Box>
                </Box>
            </div>

            {/* Branch Inventory Modal */}
            <Dialog 
                open={openBranchesModal} 
                onClose={() => setOpenBranchesModal(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Branch Inventory Management</DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Branch</TableCell>
                                    <TableCell align="right">Stock</TableCell>
                                    <TableCell align="right">Expiry Date</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {medicineDetails.branchInventory.map((branch) => (
                                    <TableRow key={branch.branch_id}>
                                        <TableCell>{branch.branch_name}</TableCell>
                                        <TableCell align="right">{branch.stock}</TableCell>
                                        <TableCell align="right">
                                            {branch.expiryDate ? new Date(branch.expiryDate).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton 
                                                onClick={() => handleEditInventory(
                                                    branch.branch_id,
                                                    branch.stock,
                                                    branch.expiryDate
                                                )}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBranchesModal(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Inventory Modal */}
            <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)}>
                <DialogTitle>Edit Branch Inventory</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <TextField
                            label="Stock"
                            type="number"
                            value={editStock}
                            onChange={(e) => setEditStock(Number(e.target.value))}
                            fullWidth
                        />
                        <TextField
                            label="Expiry Date"
                            type="date"
                            value={editExpiryDate}
                            onChange={(e) => setEditExpiryDate(e.target.value)}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditModal(false)}>Cancel</Button>
                    <Button onClick={handleSaveInventory} variant="contained" color="primary">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Print Dialog */}
            <Dialog
                open={openPrintDialog}
                onClose={handlePrintClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        minHeight: '80vh',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }
                }}
            >
                <DialogTitle>Print Medicine Details</DialogTitle>
                <DialogContent>
                    <MedicinePrintView
                        medicineData={{
                            name: medicineDetails.medicineInfo.name,
                            brand_name: medicineDetails.medicineInfo.brand_name,
                            barcode: medicineDetails.medicineInfo.barcode,
                            category: medicineDetails.medicineInfo.category_name,
                            price: medicineDetails.medicineInfo.price,
                            description: medicineDetails.medicineInfo.description,
                            sideEffects: medicineDetails.medicineInfo.sideEffects,
                            dosage: `${medicineDetails.medicineInfo.dosage_amount} ${medicineDetails.medicineInfo.dosage_unit}`,
                            pieces_per_box: medicineDetails.medicineInfo.pieces_per_box,
                            requiresPrescription: medicineDetails.medicineInfo.requiresPrescription === 1,
                            branchInventory: medicineDetails.branchInventory.map(branch => ({
                                branch_name: branch.branch_name,
                                stock: branch.stock,
                                expiryDate: branch.expiryDate
                            }))
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handlePrintClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ViewMedicineDescription;
