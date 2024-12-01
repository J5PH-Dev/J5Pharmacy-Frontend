import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack, TextField, InputAdornment, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Alert, Autocomplete, Checkbox, FormControlLabel, Card, CardActionArea, CardMedia, CardContent } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import { useParams } from 'react-router-dom';

function createData(groupName: string, noOfMedicine: string) {
    return { groupName, noOfMedicine };
}



const VIewMedicineDescription = () => {
    const navigate = useNavigate();
    const { medicineName } = useParams<{ medicineName: string }>();
    const [openAddMedicineModal, setOpenAddMedicineModal] = useState(false); // State for modal

    const handleBreadcrumbClick = (path: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(path);
    };

    const handleAddNewItemClick = () => {

    };


    const handleAddMedicineToGroup = () => {

        // Close modal and reset state
        setOpenAddMedicineModal(false);

    }

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

            {/* Add Medicine Modal */}
            <Dialog
                open={openAddMedicineModal}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        setOpenAddMedicineModal(false); // Close the modal only for non-backdrop clicks
                    }
                }}
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        padding: 2,
                        boxShadow: 5,
                        maxWidth: "567px"
                    },
                }}
                BackdropProps={{
                    onClick: (event) => event.stopPropagation() // Prevent closing the modal when clicking outside
                }}
            >
                <DialogTitle>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
                        Add Medicines to Group
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        Select multiple medicines from the list below to add them to the group.
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between', padding: 2 }}>
                    <Button
                        onClick={() => setOpenAddMedicineModal(false)}
                        variant="outlined"
                        color="secondary"
                        sx={{ borderRadius: 2, padding: '10px 20px' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddMedicineToGroup}
                        variant="contained"
                        color="primary"
                        sx={{
                            borderRadius: 2,
                            padding: '10px 20px',
                            backgroundColor: '#01A768',
                            '&:hover': { backgroundColor: '#017F4A' },
                        }}
                    >
                        Add Medicine
                    </Button>
                </DialogActions>
            </Dialog>

            <FormControlLabel control={<Checkbox sx={{ color: 'black', '&.Mui-checked': { color: 'black' }, }} />}
                label="Requires Prescription" style={{ marginTop: '-10px', marginBottom: '14px', }}
                sx={{
                    '& .MuiFormControlLabel-label': {
                        fontWeight: 600, // Medium weight
                    },
                }}
            />

<Card sx={{ maxWidth: 345, padding: 0 }}>
    <CardContent sx={{ padding: 0 }}>
        <Typography 
            variant="h6" 
            sx={{ 
                fontWeight: 'bold', 
                borderBottom: '2px solid #e0e0e0',  // Add a bottom border line
                paddingBottom: '8px',  // Optional: adds spacing between the text and the line
            }}
        >
            Medicine
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>298</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Medicine ID</Typography>
            </Box>
            <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>24</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Medicine Group</Typography>
            </Box>
        </Box>
    </CardContent>
</Card>




        </Box>
    );
};

export default VIewMedicineDescription;
