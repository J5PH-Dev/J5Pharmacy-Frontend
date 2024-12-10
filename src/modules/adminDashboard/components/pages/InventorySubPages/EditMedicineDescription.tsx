import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack, TextField, InputAdornment, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Alert, Autocomplete, Checkbox, FormControlLabel, Card, CardActionArea, CardMedia, CardContent, Divider, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import WarningIcon from '@mui/icons-material/Warning';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';

const EditMedicineDescription = () => {
    const navigate = useNavigate();
    const { medicineName } = useParams<{ medicineName: string }>();
    const [openDialog, setOpenDialog] = useState(false);  // State for the confirmation dialog
    const [selectedGroup, setSelectedGroup] = useState<string>('Antibiotics');  // Default value for "Medicine Group"
    const [dialogType, setDialogType] = useState<'cancel' | 'save'>('cancel'); // To toggle dialog type

    // Mock data for medicine groups
    const medicineGroups = ['Pain Relievers',
        'Antibiotics',
        'Anti-inflammatories',
        'Diabetes Medications',
        'Blood Pressure Medications',
        'Antacids',
        'Antihistamines',
        'Antidepressants',
        'Asthma Medications',
        'Vitamins and Supplements',];

    // Correct event handler for SelectChangeEvent
    const handleGroupChange = (event: SelectChangeEvent<string>) => {
        setSelectedGroup(event.target.value);
    };

    const handleBreadcrumbClick = (path: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(path);
    };


    // Open confirmation dialog for Cancel or Save
    const handleDialogOpen = (type: 'cancel' | 'save') => {
        setDialogType(type);
        setOpenDialog(true); // Open the dialog
    };

    // Close the dialog without any action
    const cancelAction = () => {
        setOpenDialog(false); // Close dialog
    };

    // Handle confirm action based on dialog type
    const confirmAction = () => {
        if (dialogType === 'cancel') {
            // Navigate to the view-medicines-description page with a success message
            navigate(`/admin/inventory/view-medicines-description/${medicineName}`, {
                state: { successMessage: `Cancelled editing ${medicineName}` },
            });
        } else {
            navigate(`/admin/inventory/view-medicines-description/${medicineName}`, {
                state: { successMessage: `${medicineName} details have been successfully saved!` },
            });
        }

        setOpenDialog(false); // Close the dialog after confirming
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
                    id="outlined-basic"
                    label="Medicine Name"
                    value={medicineName}
                    variant="outlined"
                    sx={{ width: 340, backgroundColor: 'white' }}
                />
                <TextField
                    id="outlined-basic"
                    label="Medicine ID"
                    value="1023_1"  // Pre-filled value
                    variant="outlined"
                    sx={{ width: 340, backgroundColor: 'white' }}
                />
            </div>

            <div className='flex flex-row flex-wrap gap-5 mt-6'>
                {/* Medicine Group Selection */}
                <FormControl fullWidth sx={{ width: 340, backgroundColor: 'white' }}>
                    <InputLabel id="medicine-group-label">Medicine Group</InputLabel>
                    <Select
                        labelId="medicine-group-label"
                        id="medicine-group"
                        label="Medicine Group"
                        value={selectedGroup}  // Bind the selected value here
                        onChange={handleGroupChange} // Pass the updated event handler here
                    >
                        {medicineGroups.map((group) => (
                            <MenuItem key={group} value={group}>
                                {group}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    id="outlined-basic"
                    label="Quantity in Number"
                    value={100}  // Pre-filled value
                    variant="outlined"
                    sx={{ width: 340, backgroundColor: 'white' }}
                />
            </div>

            <div className="flex flex-col gap-5 mt-6 mb-7">
                <TextField
                    id="outlined-multiline-static"
                    label="How to use"
                    value="Take this medication by mouth with or without food as directed by your doctor, usually once daily." // Pre-filled value
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
                    value="Dizziness, lightheadedness, drowsiness, nausea, vomiting, tiredness, excess saliva/drooling, blurred vision, weight gain, constipation, headache, and trouble sleeping may occur. If any of these effects persist or worsen, consult your doctor." // Pre-filled value
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
                            defaultChecked
                            sx={{
                                color: 'black',
                                '&.Mui-checked': { color: 'black' },
                            }}
                        />
                    }
                    label="Requires Prescription"
                    sx={{
                        '& .MuiFormControlLabel-label': {
                            fontWeight: 600, // Medium weight
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
