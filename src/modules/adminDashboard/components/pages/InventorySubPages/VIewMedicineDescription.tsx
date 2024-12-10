import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack, TextField, InputAdornment, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Alert, Autocomplete, Checkbox, FormControlLabel, Card, CardActionArea, CardMedia, CardContent, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useLocation, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import CheckIcon from '@mui/icons-material/Check';

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

    useEffect(() => {
        if (successMessage) {
            const timeout = setTimeout(() => {
                setSuccessMessage(null); // Clear the message after 3 seconds
            }, 3000);

            return () => clearTimeout(timeout); // Cleanup the timeout
        }
    }, [successMessage]);

    const handleBreadcrumbClick = (path: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(path);
    };

    const handleAddNewItemClick = () => {
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


    const confirmDelete = () => {
        navigate('/admin/inventory/view-medicines-available', {
            state: { successMessage: `${medicineName} Deleted Successfully.` },
        });
    };


    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    const handleIncrement = (branch: number) => {
        if (branch === 1) setBranch1Inventory(prev => prev + 5);
        if (branch === 2) setBranch2Inventory(prev => prev + 5);
        if (branch === 3) setBranch3Inventory(prev => prev + 5);
    };

    const handleDecrement = (branch: number) => {
        if (branch === 1 && branch1Inventory > 0) setBranch1Inventory(prev => prev - 5);
        if (branch === 2 && branch2Inventory > 0) setBranch2Inventory(prev => prev - 5);
        if (branch === 3 && branch3Inventory > 0) setBranch3Inventory(prev => prev - 5);
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
                <Button variant="contained" onClick={handleAddNewItemClick} sx={{ backgroundColor: '#01A768', color: '#fff', '&:hover': { backgroundColor: '#017F4A' } }}>
                    <EditIcon sx={{ fontSize: '1rem', mr: 1 }} /> Edit Details
                </Button>
            </Box>

            <FormControlLabel control={<Checkbox defaultChecked sx={{ color: 'black', '&.Mui-checked': { color: 'black' }, }} />}
                label="Requires Prescription" style={{ marginTop: '-10px', marginBottom: '14px', }}
                sx={{
                    '& .MuiFormControlLabel-label': {
                        fontWeight: 600, // Medium weight
                    },
                }}
            />

            {/* Content Section */}
            <div className='flex flex-row flex-wrap gap-5'>

                <Box sx={{ width: '556px', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                    {/* Header Section */}
                    <Box sx={{ padding: '17px 30px', textAlign: 'left' }}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>Medicine</Typography>
                    </Box>

                    {/* Divider */}
                    <Divider />

                    {/* Content Section */}
                    <Box sx={{ padding: '21px 30px', display: 'flex', justifyContent: 'space-between' }}>
                        {/* Left Column */}
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>1023_1</Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Medicine ID</Typography>
                        </Box>

                        {/* Right Column */}
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>Antibiotic</Typography>
                            <Typography sx={{ color: 'black', fontSize: '14px' }}>Medicine Group</Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ width: '556px', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                    {/* Header Section */}
                    <div className="flex flex-row justify-between items-center">
                        <Box sx={{ padding: '14px 30px', textAlign: 'left' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>Branch Inventory</Typography>
                        </Box>
                        {/* Edit Icon Button */}
                        <Box sx={{ padding: '14px 30px', textAlign: 'left' }}>
                            <IconButton onClick={handleOpenModal}>
                                <EditIcon sx={{ fontSize: '19px', color: 'gray' }} />
                            </IconButton>
                        </Box>
                    </div>

                    {/* Modal (Dialog) */}
                    <Dialog open={openModal} onClose={handleCloseModal}>
                        <DialogTitle>Edit Branch Inventory</DialogTitle>
                        <DialogContent>
                            <Typography>Update the Inventory Levels for each Branch.</Typography>

                            {/* Branch 1 */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                <Typography>Branch 1</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <IconButton onClick={() => handleDecrement(3)}>-</IconButton>
                                    <TextField
                                        value={branch1Inventory}
                                        onChange={(e) => setBranch1Inventory(Number(e.target.value))}
                                        type="number"
                                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                                        sx={{ width: 80, mx: 1 }}
                                    />
                                    <IconButton onClick={() => handleIncrement(3)}>+</IconButton>
                                </Box>
                            </Box>

                            {/* Branch 2 */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                <Typography>Branch 2</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <IconButton onClick={() => handleDecrement(3)}>-</IconButton>
                                    <TextField
                                        value={branch2Inventory}
                                        onChange={(e) => setBranch2Inventory(Number(e.target.value))}
                                        type="number"
                                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                                        sx={{ width: 80, mx: 1 }}
                                    />
                                    <IconButton onClick={() => handleIncrement(3)}>+</IconButton>
                                </Box>
                            </Box>

                            {/* Branch 3 */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                <Typography>Branch 3</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <IconButton onClick={() => handleDecrement(3)}>-</IconButton>
                                    <TextField
                                        value={branch3Inventory}
                                        onChange={(e) => setBranch3Inventory(Number(e.target.value))}
                                        type="number"
                                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                                        sx={{ width: 80, mx: 1 }}
                                    />
                                    <IconButton onClick={() => handleIncrement(3)}>+</IconButton>
                                </Box>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseModal}>Cancel</Button>
                            <Button onClick={handleSaveChanges}>Save Changes</Button>
                        </DialogActions>
                    </Dialog>

                    {/* Divider */}
                    <Divider />

                    {/* Content Section */}
                    <Box sx={{ padding: '21px 30px', display: 'flex', justifyContent: 'space-between' }}>
                        {/* Left Column */}
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>50</Typography>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Branch 1</Typography>
                        </Box>

                        {/* Right Column */}
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>25</Typography>
                            <Typography sx={{ color: 'black', fontSize: '14px' }}>Branch 2</Typography>
                        </Box>
                        {/* Right Column */}
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>43</Typography>
                            <Typography sx={{ color: 'black', fontSize: '14px' }}>Branch 3</Typography>
                        </Box>
                    </Box>
                </Box>


                <Box sx={{ width: '1456px', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                    {/* Header Section */}
                    <Box sx={{ padding: '19px 30px', textAlign: 'left' }}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>How to use</Typography>
                    </Box>

                    {/* Divider */}
                    <Divider />

                    {/* Content Section */}
                    <Box sx={{ padding: '21px 30px', display: 'flex', justifyContent: 'space-between' }}>
                        {/* Left Column */}
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Take this medication by mouth with or without food as directed by your doctor, usually once daily.</Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ width: '1456px', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                    {/* Header Section */}
                    <Box sx={{ padding: '19px 30px', textAlign: 'left' }}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>Side Effects</Typography>
                    </Box>

                    {/* Divider */}
                    <Divider />

                    {/* Content Section */}
                    <Box sx={{ padding: '21px 30px', display: 'flex', justifyContent: 'space-between' }}>
                        {/* Left Column */}
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ color: 'black', fontSize: '15px' }}>Dizziness, lightheadedness, drowsiness, nausea, vomiting, tiredness, excess saliva/drooling, blurred vision, weight gain, constipation, headache, and trouble sleeping may occur. If any of these effects persist or worsen, consult your doctor.</Typography>
                        </Box>
                    </Box>
                </Box>

                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: 'white',
                        color: '#F0483E',
                        padding: '15px 24px',
                        border: '1px solid #F0483E',
                        textTransform: 'none', // Optional: Disable uppercase text
                        fontWeight: 'bold',
                        '&:hover': {
                            backgroundColor: '#FFF5F5', // Light background on hover
                        },
                    }}
                    onClick={handleDelete}
                    startIcon={<DeleteIcon sx={{ color: '#F0483E' }} />}
                >
                    Delete Medicine
                </Button>

                {/* Confirmation Dialog for Item Deletion */}
                <Dialog open={openDialog} onClose={cancelDelete} BackdropProps={{ onClick: (event) => event.stopPropagation() }} disableEscapeKeyDown>
                    <DialogTitle>
                        <WarningIcon sx={{ color: 'red', marginRight: 1 }} />
                        Confirm Item Deletion
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete this medicine? This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={cancelDelete} color="secondary">Cancel</Button>
                        <Button onClick={confirmDelete} color="primary">Confirm</Button>
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
