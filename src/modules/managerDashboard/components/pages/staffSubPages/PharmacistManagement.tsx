import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Avatar,
    IconButton,
    Alert,
    Snackbar,
    Switch,
    FormControlLabel,
    CircularProgress,
    Tooltip
} from '@mui/material';
import { Edit, Delete, Add as AddIcon, DeleteOutline, HelpOutline } from '@mui/icons-material';
import axios, { AxiosError } from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../../../../auth/contexts/AuthContext'; // Import useAuth

interface Branch {
    branch_id: number;
    branch_name: string;
}

interface Pharmacist {
    staff_id: number;
    name: string;
    email: string;
    phone: string;
    pin_code: string;
    branch_id: number;
    branch_name: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

interface Props {
    selectedBranch: string;
}

const PharmacistManagement: React.FC<Props> = ({ selectedBranch }) => {
    const { user } = useAuth(); // Use useAuth to get the current user
    const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedPharmacist, setSelectedPharmacist] = useState<Pharmacist | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        pin_code: '',
        branch_id: ''
    });
    const [includeArchived, setIncludeArchived] = useState(false);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openRemoveImageDialog, setOpenRemoveImageDialog] = useState(false);
    const [isRemovingImage, setIsRemovingImage] = useState(false);

    useEffect(() => {
        fetchPharmacists();
        fetchBranches();
    }, [includeArchived, selectedBranch]);

    const fetchPharmacists = async () => {
        setIsLoading(true);
        try {
            let url = `/api/staff/pharmacistsByBranches?include_archived=${includeArchived}`;
            if (user?.branchId) {
                url += `&branch_id=${user.branchId}`;
            }

            const response = await axios.get(url);
            setPharmacists(response.data.data);
        } catch (error) {
            console.error('Error fetching pharmacists:', error);
            showSnackbar('Error fetching pharmacists', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await axios.get('/api/staff/branches');
            setBranches(response.data.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
            showSnackbar('Error fetching branches', 'error');
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (event: any) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedFile(file);

            // Create a preview URL for immediate display
            const reader = new FileReader();
            reader.onload = () => {
                const previewUrl = reader.result as string;
                if (selectedPharmacist) {
                    // Update the preview for existing pharmacist
                    setSelectedPharmacist({
                        ...selectedPharmacist,
                        image_url: previewUrl
                    });
                } else {
                    // Store preview for new pharmacist
                    setImagePreview(previewUrl);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            let response;
            if (selectedPharmacist) {
                // Update pharmacist info
                response = await axios.put(`/api/staff/pharmacists/${selectedPharmacist.staff_id}`, formData);

                // Upload image separately if selected
                if (selectedFile) {
                    const imageFormData = new FormData();
                    imageFormData.append('image', selectedFile);

                    await axios.post(
                        `/api/staff/pharmacists/upload-image/${selectedPharmacist.staff_id}`,
                        imageFormData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    );
                }
            } else {
                // Create new pharmacist
                response = await axios.post('/api/staff/pharmacists', formData);

                // Upload image if selected and pharmacist was created successfully
                if (selectedFile && response.data && response.data.staffId) {
                    const imageFormData = new FormData();
                    imageFormData.append('image', selectedFile);

                    await axios.post(
                        `/api/staff/pharmacists/upload-image/${response.data.staffId}`,
                        imageFormData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    );
                }
            }

            showSnackbar(selectedPharmacist ? 'Pharmacist updated successfully' : 'Pharmacist created successfully', 'success');
            handleClose();
            fetchPharmacists();
        } catch (error) {
            console.error('Error saving pharmacist:', error);
            const axiosError = error as AxiosError<{ message: string }>;
            showSnackbar(
                axiosError.response?.data?.message || 'Error saving pharmacist',
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedPharmacist) return;

        try {
            await axios.delete(`/api/staff/pharmacists/${selectedPharmacist.staff_id}`);
            showSnackbar('Pharmacist archived successfully', 'success');
            setOpenDeleteDialog(false);
            fetchPharmacists();
        } catch (error) {
            console.error('Error archiving pharmacist:', error);
            showSnackbar('Error archiving pharmacist', 'error');
        }
    };

    const handleEdit = (pharmacist: Pharmacist) => {
        setSelectedPharmacist(pharmacist);
        setFormData({
            name: pharmacist.name,
            email: pharmacist.email,
            phone: pharmacist.phone,
            pin_code: pharmacist.pin_code,
            branch_id: pharmacist.branch_id.toString()
        });
        setSelectedFile(null); // Reset any previously selected file
        setOpenDialog(true);
        setOpenDetailsDialog(false); // Close details dialog if open
    };

    const handleClose = () => {
        setOpenDialog(false);
        setSelectedPharmacist(null);
        setSelectedFile(null);
        setImagePreview(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            pin_code: '',
            branch_id: ''
        });
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const handleArchive = async () => {
        setIsSubmitting(true);
        try {
            if (selectedPharmacist) {
                await axios.put(`/api/staff/pharmacists/${selectedPharmacist.staff_id}/archive`);
                showSnackbar('Pharmacist archived successfully', 'success');
                setOpenDeleteDialog(false);
                setSelectedPharmacist(null);
                fetchPharmacists();
            }
        } catch (error) {
            console.error('Error archiving pharmacist:', error);
            showSnackbar('Error archiving pharmacist', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRestore = async (pharmacist: Pharmacist) => {
        try {
            await axios.put(`/api/staff/pharmacists/${pharmacist.staff_id}/restore`);
            showSnackbar('Pharmacist restored successfully', 'success');
            fetchPharmacists();
        } catch (error) {
            console.error('Error restoring pharmacist:', error);
            showSnackbar('Error restoring pharmacist', 'error');
        }
    };

    const handleCardClick = (pharmacist: Pharmacist) => {
        if (!pharmacist.is_active) return; // Don't open details for archived pharmacists
        setSelectedPharmacist(pharmacist);
        setOpenDetailsDialog(true);
    };

    const handleRemoveImage = async (staffId: number) => {
        setIsRemovingImage(true);
        try {
            await axios.put(`/api/staff/pharmacists/${staffId}/remove-image`);
            showSnackbar('Profile picture removed successfully', 'success');
            setOpenRemoveImageDialog(false);
            fetchPharmacists();
        } catch (error) {
            console.error('Error removing profile picture:', error);
            showSnackbar('Error removing profile picture', 'error');
        } finally {
            setIsRemovingImage(false);
        }
    };

    const openAddNewDialog = () => {
        setSelectedPharmacist(null);
        setSelectedFile(null);
        setImagePreview(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            pin_code: '',
            branch_id: ''
        });
        setOpenDialog(true);
    };

    return (
        <Box sx={{ p: 3, height: 'calc(100vh - 200px)', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Pharmacist Management
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={includeArchived}
                                onChange={(e) => setIncludeArchived(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Show Archived Pharmacists"
                    />
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openAddNewDialog}
                    sx={{ backgroundColor: '#01A768', '&:hover': { backgroundColor: '#017F4A' } }}
                >
                    Add New Pharmacist
                </Button>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {pharmacists.map((pharmacist) => (
                        <Grid item xs={12} sm={6} md={4} key={pharmacist.staff_id}>
                            <Paper
                                onClick={() => handleCardClick(pharmacist)}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    opacity: pharmacist.is_active ? 1 : 0.7,
                                    position: 'relative',
                                    cursor: pharmacist.is_active ? 'pointer' : 'default',
                                    '&:hover': pharmacist.is_active ? {
                                        boxShadow: 3,
                                        transform: 'translateY(-2px)',
                                        transition: 'all 0.2s ease-in-out'
                                    } : {}
                                }}
                            >
                                {!pharmacist.is_active && (
                                    <Box sx={{ display: 'flex', gap: 1, position: 'absolute', top: 10, right: 10 }}>
                                        <Box
                                            sx={{
                                                backgroundColor: 'error.main',
                                                color: 'white',
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            Archived
                                        </Box>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRestore(pharmacist);
                                            }}
                                            sx={{ fontSize: '0.75rem', py: 0.5 }}
                                        >
                                            Restore
                                        </Button>
                                    </Box>
                                )}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Avatar
                                        src={pharmacist.image_url}
                                        sx={{ width: 56, height: 56, mb: 2 }}
                                    />
                                    {pharmacist.is_active && (
                                        <Box>
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(pharmacist);
                                                }}
                                                sx={{ color: '#2B7FF5' }}
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedPharmacist(pharmacist);
                                                    setOpenDeleteDialog(true);
                                                }}
                                                sx={{ color: '#D42A4C' }}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                    )}
                                </Box>

                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {pharmacist.name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                    Staff ID: {pharmacist.staff_id}
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Branch:</Typography>
                                    <Typography variant="body2">{pharmacist.branch_name}</Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Contact:</Typography>
                                    <Typography variant="body2">{pharmacist.email}</Typography>
                                    <Typography variant="body2">{pharmacist.phone}</Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>PIN Code:</Typography>
                                    <Typography variant="body2">{pharmacist.pin_code}</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Add/Edit Pharmacist Dialog */}
            <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedPharmacist ? 'Edit Pharmacist' : 'Add New Pharmacist'}</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                                    <Avatar
                                        src={selectedPharmacist?.image_url || imagePreview || undefined}
                                        sx={{ width: 100, height: 100, mb: 2 }}
                                    />

                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            startIcon={<AddIcon />}
                                        >
                                            {(selectedPharmacist?.image_url || imagePreview) ? 'Change Picture' : 'Upload Picture'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </Button>

                                        {(selectedPharmacist?.image_url || imagePreview) && (
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                startIcon={<DeleteOutline />}
                                                onClick={() => {
                                                    if (selectedPharmacist?.image_url) {
                                                        setOpenRemoveImageDialog(true);
                                                    } else {
                                                        setImagePreview(null);
                                                        setSelectedFile(null);
                                                    }
                                                }}
                                            >
                                                Remove Picture
                                            </Button>
                                        )}
                                    </Box>

                                    {selectedFile && (
                                        <Typography variant="caption" sx={{ mt: 1 }}>
                                            Selected file: {selectedFile.name}
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    name="name"
                                    label="Name"
                                    fullWidth
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="email"
                                    label="Email"
                                    fullWidth
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="phone"
                                    label="Phone"
                                    fullWidth
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="pin_code"
                                    label="PIN Code"
                                    fullWidth
                                    required
                                    value={formData.pin_code}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Branch</InputLabel>
                                    <Select
                                        name="branch_id"
                                        value={formData.branch_id}
                                        onChange={handleSelectChange}
                                        label="Branch"
                                    >
                                        {branches.map((branch) => (
                                            <MenuItem key={branch.branch_id} value={branch.branch_id}>
                                                {branch.branch_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{ backgroundColor: '#01A768', '&:hover': { backgroundColor: '#017F4A' } }}
                    >
                        {isSubmitting ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            selectedPharmacist ? 'Save Changes' : 'Create Pharmacist'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Confirm Archive</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to archive this pharmacist? This action can be reversed later.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button
                        onClick={handleArchive}
                        color="error"
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Archive'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Details Dialog */}
            <Dialog
                open={openDetailsDialog}
                onClose={() => setOpenDetailsDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Pharmacist Details
                    </Typography>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedPharmacist && (
                        <Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                                <Avatar
                                    src={selectedPharmacist.image_url}
                                    sx={{
                                        width: 150,
                                        height: 150,
                                        mb: 2,
                                        boxShadow: 3
                                    }}
                                />

                                <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {selectedPharmacist.name}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        Staff ID: {selectedPharmacist.staff_id}
                                    </Typography>
                                </Box>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                        Branch
                                    </Typography>
                                    <Typography variant="body1">{selectedPharmacist.branch_name}</Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                        Contact Information
                                    </Typography>
                                    <Typography variant="body1">Email: {selectedPharmacist.email}</Typography>
                                    <Typography variant="body1">Phone: {selectedPharmacist.phone}</Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                        PIN Code
                                    </Typography>
                                    <Typography variant="body1">{selectedPharmacist.pin_code}</Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                        Registration Date
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedPharmacist.created_at.split(' ')[0]}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
                    {selectedPharmacist?.is_active && (
                        <Button
                            onClick={() => {
                                setOpenDetailsDialog(false);
                                handleEdit(selectedPharmacist);
                            }}
                            color="primary"
                            variant="contained"
                            sx={{ backgroundColor: '#01A768', '&:hover': { backgroundColor: '#017F4A' } }}
                        >
                            Edit
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Remove Image Confirmation Dialog */}
            <Dialog
                open={openRemoveImageDialog}
                onClose={() => setOpenRemoveImageDialog(false)}
            >
                <DialogTitle>Confirm Remove Picture</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to remove the profile picture? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenRemoveImageDialog(false)}
                        disabled={isRemovingImage}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => selectedPharmacist && handleRemoveImage(selectedPharmacist.staff_id)}
                        color="error"
                        variant="contained"
                        disabled={isRemovingImage}
                    >
                        {isRemovingImage ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Remove'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PharmacistManagement; 