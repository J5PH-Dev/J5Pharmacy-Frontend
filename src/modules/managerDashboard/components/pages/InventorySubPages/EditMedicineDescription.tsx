import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack, TextField, InputAdornment, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Alert, Autocomplete, Checkbox, FormControlLabel, Card, CardActionArea, CardMedia, CardContent, Divider, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import WarningIcon from '@mui/icons-material/Warning';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';

interface MedicineDetails {
    name: string;
    barcode: string;
    group: string;
    instructions: string;
    sideEffects: string;
    brand_name: string;
    price: number;
    stock: number;
    dosage_amount: number;
    dosage_unit: string;
    pieces_per_box: number;
    expiryDate: string;
    requiresPrescription: number;
}

const EditMedicineDescription = () => {
    const navigate = useNavigate();
    const { medicineName } = useParams<{ medicineName: string }>();
    const [openDialog, setOpenDialog] = useState(false);  // State for the confirmation dialog
    const [categories, setCategories] = useState<string[]>([]);  // State for categories
    const [dialogType, setDialogType] = useState<'cancel' | 'save'>('cancel'); // To toggle dialog type

    const [medicineDetails, setMedicineDetails] = useState<MedicineDetails>({
        name: '',
        barcode: '',
        group: '',
        instructions: '',
        sideEffects: '',
        brand_name: '',
        price: 0,
        stock: 0,
        dosage_amount: 0,
        dosage_unit: '',
        pieces_per_box: 0,
        expiryDate: '',
        requiresPrescription: 0,
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/admin/inventory/get-categories');
                setCategories(response.data); // Assuming the API returns an array of strings
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchMedicineDetails = async () => {
            try {
                const response = await axios.get(`/admin/inventory/view-medicines-description/${medicineName}`);
                const medicineData = response.data.data;

                setMedicineDetails({
                    name: medicineData.name || '',
                    barcode: medicineData.barcode || '',
                    group: medicineData.category || '',
                    instructions: medicineData.description || 'No instructions available',
                    sideEffects: medicineData.sideEffects || 'No side effects listed',
                    brand_name: medicineData.brand_name || '',
                    price: medicineData.price || 0,
                    stock: medicineData.stock || 0,
                    dosage_amount: medicineData.dosage_amount || 0,
                    dosage_unit: medicineData.dosage_unit || 'mg',
                    pieces_per_box: medicineData.pieces_per_box || 0,
                    expiryDate: medicineData.expiryDate || 'N/A',
                    requiresPrescription: Number(medicineData.requiresPrescription) || 0,  // Ensuring it's a number
                });
            } catch (error) {
                console.error('Error fetching medicine details:', error);
            }
        };

        fetchMedicineDetails();
    }, [medicineName]);

    const handleGroupChange = (event: SelectChangeEvent<string>) => {
        setMedicineDetails((prev) => ({ ...prev, group: event.target.value }));
    };

    const handleBreadcrumbClick = (path: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(path);
    };


    // Open confirmation dialog for Cancel or Save
    const handleDialogOpen = (type: 'cancel' | 'save') => {
        setDialogType(type);
        setOpenDialog(true);
    };

    // Close the dialog without any action
    const cancelAction = () => {
        setOpenDialog(false); // Close dialog
    };

    // Handle confirm action based on dialog type
    const confirmAction = async () => {
        if (dialogType === 'cancel') {
            // Navigate to the view-medicines-description page with a success message
            navigate(`/admin/inventory/view-medicines-description/${medicineName}`, {
                state: { successMessage: `Cancelled editing ${medicineName}` },
            });
        } else {
            navigate(`/admin/inventory/view-medicines-description/${medicineName}`, {
                state: { successMessage: `${medicineName} details have been successfully saved!` },
            });
            try {
                // Prepare the updated medicine details
                const updatedMedicine = {
                    name: medicineDetails.name,
                    barcode: medicineDetails.barcode,
                    group: medicineDetails.group, // Ensure this is included in the request
                    instructions: medicineDetails.instructions,
                    sideEffects: medicineDetails.sideEffects,
                    brand_name: medicineDetails.brand_name,
                    price: medicineDetails.price,
                    stock: medicineDetails.stock,
                    dosage_amount: medicineDetails.dosage_amount,
                    dosage_unit: medicineDetails.dosage_unit,
                    pieces_per_box: medicineDetails.pieces_per_box,
                    expiryDate: medicineDetails.expiryDate,
                    requiresPrescription: medicineDetails.requiresPrescription,
                };

                // Ensure the backend URL includes the medicineName parameter
                const response = await axios.put(
                    `/admin/inventory/update-medicine-description/${medicineName}`,
                    updatedMedicine,
                    {
                        headers: { 'Content-Type': 'application/json' }, // Explicitly set content-type
                    }
                );

                // Handle success
                if (response.status === 200) {
                    navigate(`/admin/inventory/view-medicines-description/${medicineName}`, {
                        state: { successMessage: `${medicineName} details have been successfully saved!` },
                    });
                }
            } catch (error: any) {
                console.error('Error saving medicine details:', error?.response?.data || error.message);
                alert(error?.response?.data?.message || 'Error saving changes');
            } finally {
                setOpenDialog(false); // Close the dialog after attempting the save
            }
        }
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
                <Link color="inherit" onClick={handleBreadcrumbClick(`/admin/inventory/view-medicines-description/${medicineName}`)}>
                    {medicineName}
                </Link>
                <Typography color="text.primary">Edit Details</Typography>
            </Breadcrumbs>

            {/* Page Header */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{medicineName}</Typography>
                    <Typography variant="body1">Update the details and information of the selected medicine.</Typography>
                </Box>
            </Box>

            {/* Content Section */}
            <div className='flex flex-row flex-wrap gap-5 mt-11'>
                <TextField
                    label="Medicine Name"
                    value={medicineDetails.name}
                    onChange={(e) => setMedicineDetails((prev) => ({ ...prev, name: e.target.value }))}
                    variant="outlined"
                    sx={{ width: 340, backgroundColor: 'white' }}
                />
                <TextField
                    label="Medicine Brand Name"
                    value={medicineDetails.brand_name}
                    onChange={(e) => setMedicineDetails((prev) => ({ ...prev, brand_name: e.target.value }))}
                    variant="outlined"
                    sx={{ width: 340, backgroundColor: 'white' }}
                />
                <TextField
                    id="outlined-basic"
                    label="Barcode"
                    value={medicineDetails.barcode}
                    onChange={(e) => setMedicineDetails((prev) => ({ ...prev, barcode: e.target.value }))}
                    variant="outlined"
                    sx={{ width: 340, backgroundColor: 'white' }}
                />
                {/* Medicine Group Selection */}
                <FormControl fullWidth sx={{ width: 340, backgroundColor: 'white' }}>
                    <InputLabel id="medicine-group-label">Medicine Group</InputLabel>
                    <Select
                        labelId="medicine-group-label"
                        id="Category"
                        label="Category"
                        value={medicineDetails.group}
                        onChange={(e) => setMedicineDetails((prev) => ({ ...prev, group: e.target.value }))}
                    >
                        {categories.map((category) => (
                            <MenuItem key={category} value={category}>
                                {category}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            <div className='flex flex-row flex-wrap gap-5 mt-6'>
                {/* Price */}
                <TextField
                    label="Price"
                    variant="outlined"
                    value={medicineDetails.price}
                    onChange={(e) => setMedicineDetails((prev) => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0,  // Convert to number
                    }))}
                    sx={{ width: 340, backgroundColor: 'white' }}
                />
                {/* Stock */}
                <TextField
                    label="Stock Available"
                    variant="outlined"
                    value={medicineDetails.stock}
                    onChange={(e) => setMedicineDetails((prev) => ({
                        ...prev,
                        stock: parseInt(e.target.value, 10) || 0,  // Convert to number
                    }))}
                    sx={{ width: 340, backgroundColor: 'white' }}
                />
            </div>

            <div className='flex flex-row flex-wrap gap-5 mt-6'>
                {/* Dosage */}
                <TextField
                    label="Dosage"
                    variant="outlined"
                    value={`${medicineDetails.dosage_amount} ${medicineDetails.dosage_unit}`}  // Concatenate dosage amount and unit
                    onChange={(e) => setMedicineDetails((prev) => ({
                        ...prev,
                        dosage_amount: parseFloat(e.target.value.split(' ')[0]) || 0,  // Assuming first part is amount
                        dosage_unit: e.target.value.split(' ')[1] || '',  // Assuming second part is unit
                    }))}
                    sx={{ width: 340, backgroundColor: 'white' }}
                />
                {/* Pieces Per Box */}
                <TextField
                    label="Pieces Per Box"
                    variant="outlined"
                    value={medicineDetails.pieces_per_box}
                    onChange={(e) => setMedicineDetails((prev) => ({
                        ...prev,
                        pieces_per_box: parseInt(e.target.value, 10) || 0,  // Convert to number
                    }))}
                    sx={{ width: 340, backgroundColor: 'white' }}
                />
                {/* Expiry Date */}
                <TextField
                    label="Expiry Date"
                    variant="outlined"
                    value={medicineDetails.expiryDate}
                    onChange={(e) => setMedicineDetails((prev) => ({
                        ...prev,
                        expiryDate: e.target.value,
                    }))}
                    sx={{ width: 340, backgroundColor: 'white' }}
                />
            </div>

            <div className="flex flex-col gap-5 mt-6 mb-7">
                <TextField
                    id="outlined-multiline-static"
                    label="How to use"
                    value={medicineDetails.instructions}
                    onChange={(e) => setMedicineDetails((prev) => ({
                        ...prev,
                        instructions: e.target.value,
                    }))}
                    multiline
                    rows={4}
                    sx={{
                        width: '100%', // Full width on all screen sizes
                        backgroundColor: 'white',
                    }}
                />
                <TextField
                    id="outlined-multiline-static"
                    label="Side Effects"
                    value={medicineDetails.sideEffects}
                    onChange={(e) => setMedicineDetails((prev) => ({
                        ...prev,
                        sideEffects: e.target.value,
                    }))}
                    multiline
                    rows={4}
                    sx={{
                        width: '100%', // Full width on all screen sizes
                        backgroundColor: 'white',
                    }}
                />
            </div>

            <div className="flex flex-col sm:flex-row md:flex-row flex-wrap gap-5 mt-6 mb-7 w-full sm:w-auto md:w-auto justify-start sm:justify-between items-start sm:items-center">
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={medicineDetails.requiresPrescription === 1} // Checkbox will be checked if value is 1
                            onChange={(e) => setMedicineDetails((prev) => ({
                                ...prev,
                                requiresPrescription: e.target.checked ? 1 : 0, // Set to 1 if checked, 0 if unchecked
                            }))}
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

                <div className="flex flex-col sm:flex-row md:flex-row gap-4 mt-4 sm:mt-0">
                    <Button
                        variant="contained"
                        onClick={() => handleDialogOpen('cancel')}
                        sx={{
                            backgroundColor: '#6F6F6F',
                            padding: '13px 26px',
                            color: '#fff',
                            '&:hover': { backgroundColor: '#9F9F9F' },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => handleDialogOpen('save')}
                        sx={{
                            backgroundColor: '#01A768',
                            padding: '13px 26px',
                            color: '#fff',
                            '&:hover': { backgroundColor: '#017F4A' },
                        }}
                    >
                        Save Details
                    </Button>
                </div>
            </div>







            {/* Confirmation Dialog */}
            <Dialog open={openDialog} onClose={cancelAction} BackdropProps={{ onClick: (event) => event.stopPropagation() }} disableEscapeKeyDown>
                <DialogTitle>
                    {dialogType === 'cancel' ? (
                        <CancelIcon sx={{ color: 'red', marginRight: 1 }} />
                    ) : (
                        <SaveIcon sx={{ color: 'green', marginRight: 1 }} />
                    )}
                    {dialogType === 'cancel' ? 'Confirm Cancellation' : 'Confirm Save'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {dialogType === 'cancel'
                            ? 'Are you sure you want to cancel? Unsaved changes will be lost.'
                            : 'Are you sure you want to save the details?'}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelAction} color="secondary">Cancel</Button>
                    <Button onClick={confirmAction} color="primary">Confirm</Button>
                </DialogActions>
            </Dialog>


        </Box>
    );
};

export default EditMedicineDescription;
