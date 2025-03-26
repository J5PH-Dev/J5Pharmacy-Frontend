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
import { Edit, Delete, Add as AddIcon, Visibility, VisibilityOff, DeleteOutline, HelpOutline } from '@mui/icons-material';
import axios, { AxiosError } from 'axios';
import { format } from 'date-fns';

interface Branch {
    branch_id: number;
    branch_name: string;
}

interface User {
    user_id: number;
    employee_id: string;
    name: string;
    role: 'ADMIN' | 'MANAGER';
    email: string;
    phone: string;
    branch_id: number;
    branch_name: string;
    remarks: string;
    hired_at: string;
    image_url?: string;
    is_active: boolean;
}

interface Props {
    selectedRole: string;
    selectedBranch: string;
}

const UserManagement: React.FC<Props> = ({ selectedRole, selectedBranch }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [formData, setFormData] = useState({
        employee_id: '',
        name: '',
        password: '',
        role: 'MANAGER',
        email: '',
        phone: '',
        branch_id: '',
        remarks: '',
        hired_at: format(new Date(), 'yyyy-MM-dd')
    });
    const [includeArchived, setIncludeArchived] = useState(false);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openRemoveImageDialog, setOpenRemoveImageDialog] = useState(false);
    const [isRemovingImage, setIsRemovingImage] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchBranches();
    }, [includeArchived, selectedRole, selectedBranch]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            let url = `/api/staff/users?include_archived=${includeArchived}`;
            if (selectedRole) {
                url += `&role=${selectedRole}`;
            }
            if (selectedBranch) {
                url += `&branch_id=${selectedBranch}`;
            }
            const response = await axios.get(url);
            setUsers(response.data.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            showSnackbar('Error fetching users', 'error');
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
                if (selectedUser) {
                    // Update the preview for existing user
                    setSelectedUser({
                        ...selectedUser,
                        image_url: previewUrl
                    });
                } else {
                    // Store preview for new user
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
            if (selectedUser && selectedUser.user_id) {
                // Updating existing user
                response = await axios.put(`/api/staff/users/${selectedUser.user_id}`, formData);

                // Upload image separately if selected
                if (selectedFile) {
                    const imageFormData = new FormData();
                    imageFormData.append('image', selectedFile);
                    await axios.post(
                        `/api/staff/users/upload-image/${selectedUser.user_id}`,
                        imageFormData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    );
                }
            } else {
                // Creating new user
                response = await axios.post('/api/staff/users', formData);

                // If we have a selected file, upload it for the new user
                if (selectedFile && response.data.user_id) {
                    const imageFormData = new FormData();
                    imageFormData.append('image', selectedFile);
                    await axios.post(
                        `/api/staff/users/upload-image/${response.data.user_id}`,
                        imageFormData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    );
                }
            }

            showSnackbar(selectedUser ? 'User updated successfully' : 'User created successfully', 'success');
            handleClose();
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            const axiosError = error as AxiosError<{ message: string }>;
            showSnackbar(
                axiosError.response?.data?.message || 'Error saving user',
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;

        try {
            await axios.delete(`/api/staff/users/${selectedUser.user_id}`);
            showSnackbar('User archived successfully', 'success');
            setOpenDeleteDialog(false);
            fetchUsers();
        } catch (error) {
            console.error('Error archiving user:', error);
            showSnackbar('Error archiving user', 'error');
        }
    };

    const handleEdit = (user: User) => {
        // Prevent editing of master admin account
        if (user.employee_id === '000') {
            showSnackbar('System administrator account cannot be modified', 'error');
            return;
        }
        setSelectedUser(user);
        setFormData({
            employee_id: user.employee_id,
            name: user.name,
            password: '', // Clear password field for editing
            role: user.role,
            email: user.email,
            phone: user.phone,
            branch_id: user.branch_id.toString(),
            remarks: user.remarks,
            hired_at: user.hired_at
        });
        setSelectedFile(null); // Reset any previously selected file
        setOpenDialog(true);
        setOpenDetailsDialog(false); // Close details dialog if it's open
    };

    const handleClose = () => {
        setOpenDialog(false);
        setSelectedUser(null);
        setSelectedFile(null);
        setImagePreview(null);
        setFormData({
            employee_id: '',
            name: '',
            password: '',
            role: 'MANAGER',
            email: '',
            phone: '',
            branch_id: '',
            remarks: '',
            hired_at: format(new Date(), 'yyyy-MM-dd')
        });
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const handleArchive = async () => {
        // Prevent archiving of master admin account
        if (selectedUser?.employee_id === '000') {
            showSnackbar('System administrator account cannot be archived', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            if (selectedUser) {
                await axios.put(`/api/staff/users/${selectedUser.user_id}/archive`);
                showSnackbar('User archived successfully', 'success');
                setOpenDeleteDialog(false);
                setSelectedUser(null);
                fetchUsers();
            }
        } catch (error) {
            console.error('Error archiving user:', error);
            showSnackbar('Error archiving user', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRestore = async (user: User) => {
        try {
            await axios.put(`/api/staff/users/${user.user_id}/restore`);
            showSnackbar('User restored successfully', 'success');
            fetchUsers();
        } catch (error) {
            console.error('Error restoring user:', error);
            showSnackbar('Error restoring user', 'error');
        }
    };

    const handleCardClick = (user: User) => {
        if (!user.is_active) return; // Don't open details for archived users
        setSelectedUser(user);
        setOpenDetailsDialog(true);
    };

    const handleRemoveImage = async (userId: number) => {
        setIsRemovingImage(true);
        try {
            await axios.put(`/api/staff/users/${userId}/remove-image`);
            showSnackbar('Profile picture removed successfully', 'success');
            setOpenRemoveImageDialog(false);

            // Refresh the users list
            fetchUsers();
        } catch (error) {
            console.error('Error removing profile picture:', error);
            showSnackbar('Error removing profile picture', 'error');
        } finally {
            setIsRemovingImage(false);
        }
    };

    const openAddNewDialog = () => {
        setSelectedUser(null);
        setSelectedFile(null);
        setImagePreview(null);
        setFormData({
            employee_id: '',
            name: '',
            password: '',
            role: 'MANAGER',
            email: '',
            phone: '',
            branch_id: '',
            remarks: '',
            hired_at: format(new Date(), 'yyyy-MM-dd')
        });
        setOpenDialog(true);
    };

    return (
        <Box sx={{ p: 3, height: 'calc(100vh - 200px)', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                        User Management
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={includeArchived}
                                onChange={(e) => setIncludeArchived(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Show Archived Users"
                    />
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openAddNewDialog}
                    sx={{ backgroundColor: '#01A768', '&:hover': { backgroundColor: '#017F4A' } }}
                >
                    Add New User
                </Button>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {users.map((user) => (
                        <Grid item xs={12} sm={6} md={4} key={user.user_id}>
                            <Paper
                                onClick={() => handleCardClick(user)}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    opacity: user.is_active ? 1 : 0.7,
                                    position: 'relative',
                                    cursor: user.is_active ? 'pointer' : 'default',
                                    '&:hover': user.is_active ? {
                                        boxShadow: 3,
                                        transform: 'translateY(-2px)',
                                        transition: 'all 0.2s ease-in-out'
                                    } : {}
                                }}
                            >
                                {!user.is_active && (
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
                                                handleRestore(user);
                                            }}
                                            sx={{ fontSize: '0.75rem', py: 0.5 }}
                                        >
                                            Restore
                                        </Button>
                                    </Box>
                                )}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Avatar
                                        src={user.image_url}
                                        sx={{ width: 56, height: 56, mb: 2 }}
                                    />
                                    {user.is_active && user.employee_id !== '000' && (
                                        <Box>
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(user);
                                                }}
                                                sx={{ color: '#2B7FF5' }}
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedUser(user);
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
                                    {user.name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                    {user.employee_id} - {user.role}
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Branch:</Typography>
                                    <Typography variant="body2">{user.branch_name}</Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Contact:</Typography>
                                    <Typography variant="body2">{user.email}</Typography>
                                    <Typography variant="body2">{user.phone}</Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Hired Date:</Typography>
                                    <Typography variant="body2">
                                        {format(new Date(user.hired_at), 'MM/dd/yyyy')}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Add/Edit User Dialog */}
            <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                                    <Avatar
                                        src={selectedUser?.image_url || imagePreview || undefined}
                                        sx={{ width: 100, height: 100, mb: 2 }}
                                    />

                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            startIcon={<AddIcon />}
                                        >
                                            {(selectedUser?.image_url || imagePreview) ? 'Change Picture' : 'Upload Picture'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </Button>

                                        {(selectedUser?.image_url || imagePreview) && (
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                startIcon={<DeleteOutline />}
                                                onClick={() => {
                                                    if (selectedUser?.image_url) {
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

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="employee_id"
                                    label="Employee ID"
                                    fullWidth
                                    required
                                    value={formData.employee_id}
                                    onChange={handleInputChange}
                                    disabled={!!selectedUser}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
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
                                <FormControl fullWidth required>
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleSelectChange}
                                        label="Role"
                                    >
                                        <MenuItem value="ADMIN">Admin</MenuItem>
                                        <MenuItem value="MANAGER">Manager</MenuItem>
                                    </Select>
                                </FormControl>
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
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    margin="normal"
                                    required={!selectedUser}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name="remarks"
                                    label="Remarks"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={formData.remarks}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name="hired_at"
                                    label="Hired Date"
                                    type="date"
                                    fullWidth
                                    required
                                    value={formData.hired_at}
                                    onChange={handleInputChange}
                                    InputLabelProps={{ shrink: true }}
                                />
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
                            selectedUser ? 'Save Changes' : 'Create User'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Confirm Archive</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to archive this user? This action can be reversed later.
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
                        User Details
                    </Typography>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedUser && (
                        <Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                                <Avatar
                                    src={selectedUser.image_url}
                                    sx={{
                                        width: 150,
                                        height: 150,
                                        mb: 2,
                                        boxShadow: 3
                                    }}
                                />

                                <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {selectedUser.name}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        {selectedUser.employee_id} - {selectedUser.role}
                                    </Typography>
                                </Box>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                        Branch
                                    </Typography>
                                    <Typography variant="body1">{selectedUser.branch_name}</Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                        Contact Information
                                    </Typography>
                                    <Typography variant="body1">Email: {selectedUser.email}</Typography>
                                    <Typography variant="body1">Phone: {selectedUser.phone}</Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                        Hired Date
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedUser.hired_at.split(' ')[0]}
                                    </Typography>
                                </Grid>

                                {selectedUser.remarks && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                            Remarks
                                        </Typography>
                                        <Typography variant="body1">{selectedUser.remarks}</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
                    {selectedUser?.is_active && selectedUser?.employee_id !== '000' && (
                        <Button
                            onClick={() => {
                                setOpenDetailsDialog(false);
                                handleEdit(selectedUser);
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
                        onClick={() => selectedUser && handleRemoveImage(selectedUser.user_id)}
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

export default UserManagement; 