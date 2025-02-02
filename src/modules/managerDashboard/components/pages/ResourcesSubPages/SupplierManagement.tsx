import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Tooltip,
    Alert,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface Supplier {
    supplier_id: number;
    supplier_name: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    is_active: boolean;
}

const SupplierManagement: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [formData, setFormData] = useState({
        supplier_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/resources/suppliers');
            setSuppliers(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch suppliers');
            console.error('Error fetching suppliers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (supplier?: Supplier) => {
        if (supplier) {
            setSelectedSupplier(supplier);
            setFormData({
                supplier_name: supplier.supplier_name,
                contact_person: supplier.contact_person,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address
            });
        } else {
            setSelectedSupplier(null);
            setFormData({
                supplier_name: '',
                contact_person: '',
                email: '',
                phone: '',
                address: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedSupplier(null);
        setFormData({
            supplier_name: '',
            contact_person: '',
            email: '',
            phone: '',
            address: ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (selectedSupplier) {
                await axios.put(`/api/resources/suppliers/${selectedSupplier.supplier_id}`, formData);
            } else {
                await axios.post('/api/resources/suppliers', formData);
            }
            fetchSuppliers();
            handleCloseDialog();
            setError('');
        } catch (err) {
            setError('Failed to save supplier');
            console.error('Error saving supplier:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (supplierId: number) => {
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            setLoading(true);
            try {
                await axios.delete(`/api/resources/suppliers/${supplierId}`);
                fetchSuppliers();
                setError('');
            } catch (err) {
                setError('Failed to delete supplier');
                console.error('Error deleting supplier:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" component="h2">
                    Supplier List
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                        backgroundColor: '#1B3E2D',
                        '&:hover': {
                            backgroundColor: '#2D5741',
                        },
                    }}
                >
                    Add Supplier
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Supplier Name</TableCell>
                            <TableCell>Contact Person</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : suppliers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No suppliers found
                                </TableCell>
                            </TableRow>
                        ) : (
                            suppliers
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((supplier) => (
                                    <TableRow key={supplier.supplier_id}>
                                        <TableCell>{supplier.supplier_name}</TableCell>
                                        <TableCell>{supplier.contact_person}</TableCell>
                                        <TableCell>{supplier.email}</TableCell>
                                        <TableCell>{supplier.phone}</TableCell>
                                        <TableCell>{supplier.address}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    onClick={() => handleOpenDialog(supplier)}
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    onClick={() => handleDelete(supplier.supplier_id)}
                                                    size="small"
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={suppliers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Supplier Name"
                            type="text"
                            fullWidth
                            required
                            value={formData.supplier_name}
                            onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Contact Person"
                            type="text"
                            fullWidth
                            value={formData.contact_person}
                            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Email"
                            type="email"
                            fullWidth
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Phone"
                            type="tel"
                            fullWidth
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Address"
                            type="text"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button 
                            type="submit" 
                            variant="contained"
                            disabled={loading}
                            sx={{
                                backgroundColor: '#1B3E2D',
                                '&:hover': {
                                    backgroundColor: '#2D5741',
                                },
                            }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Save'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default SupplierManagement;
