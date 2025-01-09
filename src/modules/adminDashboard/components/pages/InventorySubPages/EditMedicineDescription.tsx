import React, { useState, useEffect } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, Alert, SelectChangeEvent } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';

// Add the dosage units array
const DOSAGE_UNITS = [
    'mg',
    'mcg',
    'g',
    'kg',
    'ml',
    'l',
    'tablet',
    'capsule',
    'pill',
    'patch',
    'spray',
    'drop',
    'mg/ml',
    'mcg/ml',
    'mg/l',
    'mcg/l',
    'mg/g',
    'mcg/g',
    'IU',
    'mEq',
    'mmol',
    'unit',
    'puff',
    'application',
    'sachet',
    'suppository',
    'ampoule',
    'vial',
    'syringe',
    'piece'
];

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
    };
}

// Add Category interface
interface Category {
    category_id: number;
    name: string;
    prefix: string;
}

const EditMedicineDescription = () => {
    const navigate = useNavigate();
    const { medicineName } = useParams<{ medicineName: string }>();
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState<'save' | 'cancel'>('save');
    const [categories, setCategories] = useState<Category[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        brand_name: '',
        barcode: '',
        category: '',
        price: '',
        pieces_per_box: '',
        dosage_amount: '',
        dosage_unit: '',
        description: '',
        sideEffects: '',
        requiresPrescription: false
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/admin/inventory/categories');
                console.log('Categories from API:', response.data);
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const fetchMedicineDetails = async () => {
            try {
                const response = await axios.get(`/admin/inventory/view-medicines-description/${medicineName}`);
                const { medicineInfo } = response.data;
                console.log('Medicine details from API:', medicineInfo);
                
                // Remove peso sign if it exists in the price
                const cleanPrice = medicineInfo.price.startsWith('₱') ? 
                    medicineInfo.price.substring(1) : medicineInfo.price;

                setFormData({
                    name: medicineInfo.name,
                    brand_name: medicineInfo.brand_name,
                    barcode: medicineInfo.barcode,
                    category: medicineInfo.category_name,
                    price: cleanPrice,
                    pieces_per_box: medicineInfo.pieces_per_box.toString(),
                    dosage_amount: medicineInfo.dosage_amount.toString(),
                    dosage_unit: medicineInfo.dosage_unit,
                    description: medicineInfo.description,
                    sideEffects: medicineInfo.sideEffects,
                    requiresPrescription: medicineInfo.requiresPrescription === 1
                });
            } catch (error) {
                console.error('Error fetching medicine details:', error);
                setErrorMessage('Error fetching medicine details');
            }
        };

        fetchCategories();
        fetchMedicineDetails();
    }, [medicineName]);

    const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        let value = event.target.value;
        
        // Remove the peso sign if it's the price field and starts with ₱
        if (field === 'price' && value.startsWith('₱')) {
            value = value.substring(1);
        }
        
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSelectChange = (field: string) => (event: SelectChangeEvent) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            requiresPrescription: event.target.checked
        }));
    };

    const handleCategoryChange = (event: any) => {
        setFormData(prev => ({
            ...prev,
            category: event.target.value
        }));
    };

    const handleDialogOpen = (type: 'save' | 'cancel') => {
        setDialogType(type);
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const handleBreadcrumbClick = (path: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(path);
    };

    const handleCancel = () => {
        navigate(`/admin/inventory/view-medicines-description/${medicineName}`);
    };

    const handleSave = async () => {
        try {
            // Remove peso sign from price if present
            const priceValue = formData.price.startsWith('₱') ? 
                formData.price.substring(1) : formData.price;

            await axios.post(`/admin/inventory/edit-medicine/${medicineName}`, {
                name: formData.name,
                brand_name: formData.brand_name,
                barcode: formData.barcode,
                category: formData.category,
                price: priceValue,
                description: formData.description,
                sideEffects: formData.sideEffects,
                dosage_amount: parseInt(formData.dosage_amount),
                dosage_unit: formData.dosage_unit,
                pieces_per_box: parseInt(formData.pieces_per_box),
                requiresPrescription: formData.requiresPrescription ? 1 : 0
            });

            setSuccessMessage('Medicine details updated successfully');
            setTimeout(() => {
                navigate(`/admin/inventory/view-medicines-description/${formData.barcode}`, {
                    state: { successMessage: 'Medicine details updated successfully' }
                });
            }, 1500);
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Error updating medicine details');
        }
        handleDialogClose();
    };

    // Function to get display name
    const getDisplayName = () => {
        if (!formData) return 'Loading...';
        return formData.brand_name ? `${formData.name} (${formData.brand_name})` : formData.name;
    };

    return (
        <Box sx={{ p: 0, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>
            {/* Messages */}
            {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
            )}
            {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>
            )}

            {/* Form */}
            <Box sx={{ 
                backgroundColor: 'white',
                borderRadius: 1,
                boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
                p: 3
            }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Edit Medicine Details</Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                    <TextField
                        label="Medicine Name"
                        value={formData.name}
                        onChange={handleInputChange('name')}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Brand Name"
                        value={formData.brand_name}
                        onChange={handleInputChange('brand_name')}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Barcode"
                        value={formData.barcode}
                        onChange={handleInputChange('barcode')}
                        fullWidth
                        required
                    />
                    <FormControl fullWidth required>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={formData.category}
                            onChange={handleCategoryChange}
                            label="Category"
                        >
                            {categories.map((category) => (
                                <MenuItem key={category.category_id} value={category.name}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Price"
                        value={formData.price}
                        onChange={handleInputChange('price')}
                        fullWidth
                        required
                        type="text"
                        InputProps={{
                            startAdornment: <Typography>₱</Typography>
                        }}
                    />
                    <TextField
                        label="Pieces per Box"
                        value={formData.pieces_per_box}
                        onChange={handleInputChange('pieces_per_box')}
                        fullWidth
                        required
                        type="number"
                    />
                    <TextField
                        label="Dosage Amount"
                        value={formData.dosage_amount}
                        onChange={handleInputChange('dosage_amount')}
                        fullWidth
                        required
                        type="number"
                    />
                    <FormControl fullWidth required>
                        <InputLabel>Dosage Unit</InputLabel>
                        <Select
                            value={formData.dosage_unit}
                            onChange={handleSelectChange('dosage_unit')}
                            label="Dosage Unit"
                        >
                            {DOSAGE_UNITS.map((unit) => (
                                <MenuItem key={unit} value={unit}>
                                    {unit}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <TextField
                    label="Description / How to Use"
                    value={formData.description}
                    onChange={handleInputChange('description')}
                    fullWidth
                    required
                    multiline
                    rows={4}
                    sx={{ mb: 3 }}
                />

                <TextField
                    label="Side Effects"
                    value={formData.sideEffects}
                    onChange={handleInputChange('sideEffects')}
                    fullWidth
                    required
                    multiline
                    rows={4}
                    sx={{ mb: 3 }}
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formData.requiresPrescription}
                            onChange={handleCheckboxChange}
                        />
                    }
                    label="Requires Prescription"
                    sx={{ mb: 3 }}
                />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={() => handleDialogOpen('cancel')}
                        startIcon={<CancelIcon />}
                        sx={{
                            bgcolor: 'grey.500',
                            '&:hover': { bgcolor: 'grey.600' }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => handleDialogOpen('save')}
                        startIcon={<SaveIcon />}
                        sx={{
                            bgcolor: '#01A768',
                            '&:hover': { bgcolor: '#017F4A' }
                        }}
                    >
                        Save Changes
                    </Button>
                </Box>
            </Box>

            {/* Confirmation Dialog */}
            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>
                    {dialogType === 'save' ? 'Save Changes' : 'Cancel Edit'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {dialogType === 'save' 
                            ? 'Are you sure you want to save these changes?'
                            : 'Are you sure you want to cancel? All changes will be lost.'}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>No</Button>
                    <Button 
                        onClick={dialogType === 'save' ? handleSave : handleCancel}
                        variant="contained"
                        color={dialogType === 'save' ? 'primary' : 'error'}
                    >
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EditMedicineDescription;
