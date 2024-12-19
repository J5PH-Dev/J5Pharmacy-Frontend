import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack, TextField, InputAdornment, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Alert, Autocomplete, Checkbox, FormControlLabel, Card, CardActionArea, CardMedia, CardContent, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useLocation, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import CheckIcon from '@mui/icons-material/Check';
import axios from 'axios';

interface MedicineDetails {
    barcode: string;
    group: string;
    instructions: string;
    sideEffects: string;
    brand_name: string; // New field
    price: number; // New field
    stock: number; // New field
    dosage_amount: number; // New field
    dosage_unit: string; // New field
    pieces_per_box: number; // New field
    expiryDate: string; // New field
    requiresPrescription: number; // New field (0 or 1)
}


interface Branch {
    id: number;
    name: string;
    inventory: number;
}

const VIewMedicineDescription = () => {
    const navigate = useNavigate();
    const { medicineName } = useParams<{ medicineName: string }>();
    const [openAddMedicineModal, setOpenAddMedicineModal] = useState(false); // State for modal
    const [openDialog, setOpenDialog] = useState(false);  // State for the confirmation dialog
    const [deleteType, setDeleteType] = useState<'item' | 'group'>('item'); // Type of deletion (item or group)
    const location = useLocation();
    const [openModal, setOpenModal] = useState(false); // State for the modal
    const [branch1Inventory, setBranch1Inventory] = useState(50);  // Branch 1 inventory state
    const [branch2Inventory, setBranch2Inventory] = useState(25);  // Branch 2 inventory state
    const [branch3Inventory, setBranch3Inventory] = useState(43);  // Branch 3 inventory state

    const successMessageFromDeletion = location.state?.successMessage;
    const [successMessage, setSuccessMessage] = useState<string | null>(successMessageFromDeletion);

    const [branches, setBranches] = useState<Branch[]>([]);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [medicineDetails, setMedicineDetails] = useState<MedicineDetails>({
        barcode: '',
        group: '',
        instructions: '',
        sideEffects: '',
        brand_name: '', // New field
        price: 0, // New field
        stock: 0, // New field
        dosage_amount: 0, // New field
        dosage_unit: '', // New field
        pieces_per_box: 0, // New field
        expiryDate: '', // New field
        requiresPrescription: 0, // New field (0 or 1)
    });

    useEffect(() => {
        if (successMessage) {
            const timeout = setTimeout(() => {
                setSuccessMessage(null); // Clear the message after 3 seconds
            }, 3000);

            return () => clearTimeout(timeout); // Cleanup the timeout
        }
    }, [successMessage]);

    useEffect(() => {
        const fetchMedicineDetails = async () => {
            try {
                const response = await axios.get(`/admin/inventory/view-medicines-description/${medicineName}`);
                const medicineData = response.data.data;
                console.log(medicineData); // Check if it prints the expected value (1 or 0)

                // Map the API response to the state structure with the new fields
                setMedicineDetails({
                    barcode: medicineData.barcode.toString(), // Ensure the ID is a string
                    group: medicineData.category, // Use name as the group
                    instructions: medicineData.description || 'No instructions available', // Handle null case
                    sideEffects: medicineData.sideEffects || 'No side effects listed', // Handle null case
                    brand_name: medicineData.brand_name || 'No brand name', // New field
                    price: medicineData.price || 0, // New field
                    stock: medicineData.stock || 0, // New field
                    dosage_amount: medicineData.dosage_amount || 0, // New field
                    dosage_unit: medicineData.dosage_unit || 'mg', // New field (default value 'mg')
                    pieces_per_box: medicineData.pieces_per_box || 0, // New field
                    expiryDate: medicineData.expiryDate || 'N/A', // New field
                    requiresPrescription: medicineData.requiresPrescription || 0, // New field (0 or 1)
                });
            } catch (error: any) {
                setErrorMessage(error.response?.data?.message || 'Error fetching medicine details');
            }
        };

        fetchMedicineDetails();
    }, [medicineName]);



    const handleBreadcrumbClick = (path: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(path);
    };

    const handleEditItemClick = () => {
        navigate(`/admin/inventory/view-medicines-description/${medicineName}/edit-details`)
    };



    const handleAddMedicineToGroup = () => {
        // Close modal and reset state
        setOpenAddMedicineModal(false);
    }


    const handleDelete = () => {
        setDeleteType('item'); // You can set this based on what you're deleting
        setOpenDialog(true);  // Show the dialog
    };

    const handleSaveChanges = () => {
        // Logic to save the changes (e.g., updating the inventory, etc.)
        console.log("Changes saved successfully!");

        // Set success message
        setSuccessMessage('Changes saved successfully!');

        // Close the modal after saving
        handleCloseModal();
    };


    const confirmDelete = async () => {
        try {
            // Make the DELETE request to the backend, using medicineName
            await axios.delete(`/admin/inventory/edit-delete/${medicineName}`);

            // Redirect to the medicines list after deletion
            navigate('/admin/inventory/view-medicines-available', {
                state: { successMessage: `${medicineName} Deleted Successfully.` },
            });
        } catch (error) {
            console.error('Error deleting medicine:', error);
            // Optionally, show an error message to the user
        }
    };


    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    const handleIncrement = (index: number) => {
        const updatedBranches = [...branches];
        updatedBranches[index].inventory += 1;
        setBranches(updatedBranches);
    };

    const handleDecrement = (index: number) => {
        const updatedBranches = [...branches];
        if (updatedBranches[index].inventory > 0) {
            updatedBranches[index].inventory -= 1;
            setBranches(updatedBranches);
        }
    };

    const handleInventoryChange = (index: number, value: number) => {
        const updatedBranches = [...branches];
        updatedBranches[index].inventory = value;
        setBranches(updatedBranches);
    };

    const handleDialogOpen = () => {
        setOpenDialog(true);
    };


    const cancelDelete = () => {
        setOpenDialog(false);  // Close the dialog without deleting
    };

    return (
        <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs
                aria-label="breadcrumb"
                sx={{
                    mb: 2,
                    display: 'flex',
                    justifyContent: { xs: 'center', sm: 'flex-start' },
                }}
            >
                <Link color="inherit" onClick={handleBreadcrumbClick('/admin/inventory')}>Inventory</Link>
                <Link color="inherit" onClick={handleBreadcrumbClick('/admin/inventory/view-medicines-available')}>List of Medicine</Link>
                <Typography color="text.primary">{medicineName}</Typography>
            </Breadcrumbs>

            {/* Page Header */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{medicineName}</Typography>
                    <Typography variant="body1">List of medicines available for sales.</Typography>
                </Box>
                <Button variant="contained" onClick={handleEditItemClick} sx={{ backgroundColor: '#01A768', color: '#fff', '&:hover': { backgroundColor: '#017F4A' } }}>
                    <EditIcon sx={{ fontSize: '1rem', mr: 1 }} /> Edit Details
                </Button>
            </Box>

            <FormControlLabel
                control={
                    <Checkbox
                        checked={medicineDetails.requiresPrescription === 1} // Ensure checked is based on the updated state
                        disabled // Keep it disabled to prevent interaction
                        sx={{
                            color: 'black',
                            '&.Mui-checked': { color: 'black' },
                        }}
                    />
                }
                label="Requires Prescription"
                sx={{
                    marginTop: '-10px',
                    marginBottom: '14px',
                    '& .MuiFormControlLabel-label': {
                        fontWeight: 600,
                    },
                }}
            />


            {/* Content Section */}
            {/* Content Section */}
            <div className='flex flex-row flex-wrap gap-5'>
                {/* Medicine Details Box */}
                <Box
                    sx={{
                        width: '556px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    {/* Header */}
                    <Box sx={{ padding: '17px 30px', textAlign: 'left' }}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>Medicine</Typography>
                    </Box>
                    <Divider />
                    {/* Content */}
                    <Box sx={{ padding: '21px 30px', display: 'flex', justifyContent: 'space-between' }}>
                        {/* Left Column */}
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                {medicineDetails.barcode}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Medicine ID</Typography>
                        </Box>

                        {/* Right Column */}
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                {medicineDetails.group}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Medicine Group</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Branch Inventory */}
                <Box
                    sx={{
                        width: '556px',
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
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>Branch Inventory</Typography>
                        </Box>
                        <Box sx={{ padding: '14px 30px', textAlign: 'left' }}>
                            <IconButton onClick={handleOpenModal}>
                                <EditIcon sx={{ fontSize: '19px', color: 'gray' }} />
                            </IconButton>
                        </Box>
                    </div>
                    <Divider />
                    {/* Content Section */}
                    {branches.map((branch, index) => (
                        <Box key={branch.id} sx={{ padding: '21px 30px', display: 'flex', justifyContent: 'space-between' }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>{branch.inventory}</Typography>
                                <Typography sx={{ color: 'black', fontSize: '15px' }}>{branch.name}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>


                {/* Medicine Info Section (Brand, Price, Stock, Dosage, Pieces Per Box, Expiry Date) */}
                <Box
                    sx={{
                        width: '1456px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    {/* Header */}
                    <Box sx={{ padding: '17px 30px', textAlign: 'left' }}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>Medicine Info</Typography>
                    </Box>
                    <Divider />

                    {/* Content (Three Columns per Row) */}
                    <Box sx={{ padding: '21px 30px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                        {/* Brand Name */}
                        <Box sx={{ flex: '1 1 30%' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                {medicineDetails.brand_name}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Brand Name</Typography>
                        </Box>

                        {/* Price */}
                        <Box sx={{ flex: '1 1 30%' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                ${medicineDetails.price}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Price</Typography>
                        </Box>

                        {/* Stock */}
                        <Box sx={{ flex: '1 1 30%' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                {medicineDetails.stock}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Stock Available</Typography>
                        </Box>

                        {/* Dosage */}
                        <Box sx={{ flex: '1 1 30%' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                {medicineDetails.dosage_amount} {medicineDetails.dosage_unit}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Dosage</Typography>
                        </Box>

                        {/* Pieces Per Box */}
                        <Box sx={{ flex: '1 1 30%' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                {medicineDetails.pieces_per_box}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Pieces Per Box</Typography>
                        </Box>

                        {/* Expiry Date */}
                        <Box sx={{ flex: '1 1 30%' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                                {medicineDetails.expiryDate}
                            </Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Expiry Date</Typography>
                        </Box>
                    </Box>
                </Box>



                {/* Instructions */}
                <Box
                    sx={{
                        width: '1456px',
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
                        <Typography sx={{ color: 'black', fontSize: '15px' }}>{medicineDetails.instructions}</Typography>
                    </Box>
                </Box>

                {/* Side Effects */}
                <Box
                    sx={{
                        width: '1456px',
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
                        <Typography sx={{ color: 'black', fontSize: '15px' }}>{medicineDetails.sideEffects}</Typography>
                    </Box>
                </Box>

                {/* Delete Button */}
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: 'white',
                        color: '#F0483E',
                        padding: '15px 24px',
                        border: '1px solid #F0483E',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        '&:hover': {
                            backgroundColor: '#FFF5F5',
                        },
                    }}
                    onClick={handleDelete}
                    startIcon={<DeleteIcon sx={{ color: '#F0483E' }} />}
                >
                    Delete Medicine
                </Button>

                {/* Confirmation Dialog */}
                <Dialog open={openDialog} onClose={cancelDelete} disableEscapeKeyDown>
                    <DialogTitle>
                        <WarningIcon sx={{ color: 'red', marginRight: 1 }} />
                        Confirm Item Deletion
                    </DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to delete this medicine? This action cannot be undone.</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={cancelDelete} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={confirmDelete} color="primary">
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>


            <Box>
                {successMessage && (
                    <Alert
                        icon={<CheckIcon fontSize="inherit" />}
                        severity="success"
                        sx={{
                            position: 'fixed',
                            bottom: 20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 1201, // Ensure it's above other content
                        }}
                    >
                        {successMessage}
                    </Alert>
                )}
            </Box>

        </Box>


    );
};

export default VIewMedicineDescription;
