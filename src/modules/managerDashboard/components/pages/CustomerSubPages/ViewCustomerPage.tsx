import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
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

interface StarPoints {
    star_points_id: number;
    points_balance: number;
    total_points_earned: number;
    total_points_redeemed: number;
}

interface StarPointsTransaction {
    transaction_id: number;
    points_amount: number;
    transaction_type: 'EARNED' | 'REDEEMED';
    reference_transaction_id: string;
    created_at: string;
}

interface Prescription {
    prescription_id: number;
    doctor_name: string;
    doctor_license_number: string;
    prescription_date: string;
    expiry_date: string;
    notes: string;
    status: string;
    image_data: string | null;
    created_at: string;
    updated_at: string;
    items: PrescriptionItem[];
}

interface PrescriptionItem {
    item_id: number;
    product_id: number;
    product_name: string;
    prescribed_quantity: number;
    dispensed_quantity: number;
    dosage_instructions: string;
}

const ViewCustomerPage = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [starPoints, setStarPoints] = useState<StarPoints | null>(null);
    const [starPointsTransactions, setStarPointsTransactions] = useState<StarPointsTransaction[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);

    useEffect(() => {
        fetchCustomerData();
    }, [customerId]);

    const fetchCustomerData = async () => {
        try {
            const response = await axios.get(`/api/customers/${customerId}`);
            const { customer, starPoints, starPointsTransactions, prescriptions } = response.data.data;
            
            if (!customer) {
                setError('Customer not found');
                navigate('/manager/customer-info');
                return;
            }
            
            setCustomer(customer);
            setStarPoints(starPoints);
            setStarPointsTransactions(starPointsTransactions);
            setPrescriptions(prescriptions);
            setError(null);
        } catch (error: any) {
            console.error('Error fetching customer data:', error);
            setError(error.response?.data?.message || 'Failed to fetch customer data');
            navigate('/manager/customer-info');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrescriptionClick = (prescription: Prescription) => {
        setSelectedPrescription(prescription);
        setIsPrescriptionDialogOpen(true);
    };

    const handleImageClick = (imageData: string) => {
        setSelectedImage(imageData);
        setImageDialogOpen(true);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

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

            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/manager/customer-info')}
                    sx={{ textTransform: 'none' }}
                >
                    Back to Customers
                </Button>
                <Button
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/manager/customer-info/${customer.customer_id}/edit-details`)}
                    sx={{ textTransform: 'none' }}
                >
                    Edit
                </Button>
            </Box>

            {/* Content Grid */}
            <Grid container spacing={3}>
                {/* Left Column */}
                <Grid item xs={12} md={4}>
                    {/* Basic Information */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Customer Information</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                                    <Typography variant="body1">{customer.name}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                                    <Typography variant="body1">{customer.phone || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                                    <Typography variant="body1">{customer.email || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                                    <Typography variant="body1">{customer.address || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Discount Type</Typography>
                                    <Chip 
                                        label={customer.discount_type}
                                        color={customer.discount_type !== 'None' ? 'primary' : 'default'}
                                        size="small"
                                    />
                                    {customer.discount_id_number && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            ID: {customer.discount_id_number}
                                        </Typography>
                                    )}
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Star Points Summary */}
                    {starPoints && (
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Star Points Summary</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Current Balance</Typography>
                                        <Typography variant="h4">{starPoints.points_balance}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Total Earned</Typography>
                                        <Typography variant="body1">{starPoints.total_points_earned}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Total Redeemed</Typography>
                                        <Typography variant="body1">{starPoints.total_points_redeemed}</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    )}
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={8}>
                    {/* Star Points Transactions */}
                    {starPointsTransactions.length > 0 && (
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Star Points History</Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Date</TableCell>
                                                <TableCell>Type</TableCell>
                                                <TableCell align="right">Points</TableCell>
                                                <TableCell>Reference</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {starPointsTransactions.map((transaction) => (
                                                <TableRow key={transaction.transaction_id}>
                                                    <TableCell>
                                                        {transaction.created_at}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={transaction.transaction_type}
                                                            color={transaction.transaction_type === 'EARNED' ? 'success' : 'error'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">{transaction.points_amount}</TableCell>
                                                    <TableCell>{transaction.reference_transaction_id}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    )}

                    {/* Prescriptions */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Prescriptions</Typography>
                            <Grid container spacing={2}>
                                {prescriptions.map((prescription) => (
                                    <Grid item xs={12} sm={6} key={prescription.prescription_id}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                    <Typography variant="subtitle1">{prescription.doctor_name}</Typography>
                                                    <Chip
                                                        label={prescription.status}
                                                        color={
                                                            prescription.status === 'ACTIVE' ? 'success' :
                                                            prescription.status === 'USED' ? 'default' : 'error'
                                                        }
                                                        size="small"
                                                    />
                                                </Box>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    License: {prescription.doctor_license_number}
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    Prescribed: {prescription.prescription_date}
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    Expires: {prescription.expiry_date}
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => handlePrescriptionClick(prescription)}
                                                    startIcon={<ZoomInIcon />}
                                                    sx={{ mt: 1, textTransform: 'none' }}
                                                >
                                                    View Details
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Prescription Details Dialog */}
            <Dialog
                open={isPrescriptionDialogOpen}
                onClose={() => setIsPrescriptionDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Prescription Details
                </DialogTitle>
                <DialogContent>
                    {selectedPrescription && (
                        <Box>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Doctor</Typography>
                                    <Typography variant="body1">{selectedPrescription.doctor_name}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="textSecondary">License Number</Typography>
                                    <Typography variant="body1">{selectedPrescription.doctor_license_number}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Prescription Date</Typography>
                                    <Typography variant="body1">{selectedPrescription.prescription_date}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Expiry Date</Typography>
                                    <Typography variant="body1">{selectedPrescription.expiry_date}</Typography>
                                </Grid>
                                {selectedPrescription.image_data && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="textSecondary">Captured Image</Typography>
                                        <Box
                                            component="img"
                                            src={selectedPrescription.image_data}
                                            alt="Prescription"
                                            sx={{
                                                maxWidth: '200px',
                                                maxHeight: '200px',
                                                cursor: 'pointer',
                                                mt: 1,
                                                border: '1px solid #ddd',
                                                borderRadius: 1
                                            }}
                                            onClick={() => handleImageClick(selectedPrescription.image_data!)}
                                        />
                                    </Grid>
                                )}
                                {selectedPrescription.notes && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="textSecondary">Notes</Typography>
                                        <Typography variant="body1">{selectedPrescription.notes}</Typography>
                                    </Grid>
                                )}
                            </Grid>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Product</TableCell>
                                            <TableCell align="right">Prescribed Qty</TableCell>
                                            <TableCell align="right">Dispensed Qty</TableCell>
                                            <TableCell>Instructions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedPrescription.items.map((item) => (
                                            <TableRow key={item.item_id}>
                                                <TableCell>{item.product_name}</TableCell>
                                                <TableCell align="right">{item.prescribed_quantity}</TableCell>
                                                <TableCell align="right">{item.dispensed_quantity}</TableCell>
                                                <TableCell>{item.dosage_instructions}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsPrescriptionDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Image Preview Dialog */}
            <Dialog
                open={imageDialogOpen}
                onClose={() => setImageDialogOpen(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogContent>
                    {selectedImage && (
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <img
                                src={selectedImage}
                                alt="Prescription"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: 'calc(100vh - 100px)',
                                    objectFit: 'contain'
                                }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setImageDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ViewCustomerPage; 