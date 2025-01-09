import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Grid,
    Card,
    CardContent,
    Alert,
    Stack,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';

interface Customer {
    customer_id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
    discount_type: string;
    discount_id_number: string | null;
    created_at: string;
    updated_at: string;
}

interface ValidationErrors {
    name: boolean;
    phone: boolean;
    email: boolean;
    address: boolean;
    discount_type: boolean;
    discount_id_number: boolean;
}

const EditCustomerDescription = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        discount_type: 'None',
        discount_id_number: ''
    });
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
        name: false,
        phone: false,
        email: false,
        address: false,
        discount_type: false,
        discount_id_number: false
    });
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchCustomerData();
    }, [customerId]);

    const fetchCustomerData = async () => {
        try {
            const response = await axios.get(`/api/customers/${customerId}`);
            const { customer } = response.data.data;
            setCustomer(customer);
            setFormData({
                name: customer.name,
                phone: customer.phone || '',
                email: customer.email || '',
                address: customer.address || '',
                discount_type: customer.discount_type,
                discount_id_number: customer.discount_id_number || ''
            });
        } catch (error: any) {
            console.error('Error fetching customer data:', error);
            setError(error.response?.data?.message || 'Failed to fetch customer data');
            navigate('/admin/customer-info');
        }
    };

    const handleSave = async () => {
        const errors: ValidationErrors = {
            name: !formData.name,
            phone: false,
            email: false,
            address: false,
            discount_type: false,
            discount_id_number: formData.discount_type !== 'None' && !formData.discount_id_number
        };

        if (Object.values(errors).some(error => error)) {
            setValidationErrors(errors);
            return;
        }

        try {
            await axios.put(`/api/customers/${customerId}`, formData);
            setSuccessMessage('Customer updated successfully');
            setTimeout(() => {
                navigate(`/admin/customer-info/${customerId}`);
            }, 1500);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to update customer');
        }
    };

    if (!customer) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Customer not found</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 0, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>
            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {successMessage && (
                <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 2 }}>
                    {successMessage}
                </Alert>
            )}

            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(`/admin/customer-info/${customerId}`)}
                    sx={{ textTransform: 'none' }}
                >
                    Back to Customer Details
                </Button>
                <Button
                    startIcon={<SaveIcon />}
                    variant="contained"
                    onClick={handleSave}
                    sx={{ textTransform: 'none' }}
                >
                    Save Changes
                </Button>
            </Box>

            {/* Edit Form */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Edit Customer Information</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                label="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                fullWidth
                                required
                                error={validationErrors.name}
                                helperText={validationErrors.name ? 'Name is required' : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                fullWidth
                                multiline
                                rows={3}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Discount Type</InputLabel>
                                <Select
                                    value={formData.discount_type}
                                    label="Discount Type"
                                    onChange={(e) => setFormData({ 
                                        ...formData, 
                                        discount_type: e.target.value,
                                        discount_id_number: e.target.value === 'None' ? '' : formData.discount_id_number
                                    })}
                                >
                                    <MenuItem value="None">None</MenuItem>
                                    <MenuItem value="Senior">Senior Citizen</MenuItem>
                                    <MenuItem value="PWD">PWD</MenuItem>
                                    <MenuItem value="Employee">Employee</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Discount ID Number"
                                value={formData.discount_id_number}
                                onChange={(e) => setFormData({ ...formData, discount_id_number: e.target.value })}
                                fullWidth
                                disabled={formData.discount_type === 'None'}
                                error={validationErrors.discount_id_number}
                                helperText={validationErrors.discount_id_number ? 'Discount ID is required for this discount type' : ''}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Additional Information */}
            <Stack spacing={2} sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                    Last Updated: {new Date(customer.updated_at).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Created: {new Date(customer.created_at).toLocaleString()}
                </Typography>
            </Stack>
        </Box>
    );
};

export default EditCustomerDescription; 