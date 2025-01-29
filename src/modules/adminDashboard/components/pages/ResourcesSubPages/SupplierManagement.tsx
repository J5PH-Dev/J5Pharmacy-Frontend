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
    CircularProgress,
    Checkbox,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArchiveIcon from '@mui/icons-material/Archive';
import CheckBox from '@mui/icons-material/CheckBox';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ExportDialog from '../../common/ExportDialog';

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
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [formData, setFormData] = useState({
        supplier_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: ''
    });
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Add export columns configuration
    const exportColumns = [
        { field: 'supplier_name', header: 'Supplier Name' },
        { field: 'contact_person', header: 'Contact Person' },
        { field: 'email', header: 'Email' },
        { field: 'phone', header: 'Phone' },
        { field: 'address', header: 'Address' },
        { field: 'is_active', header: 'Status' },
        { field: 'created_at', header: 'Created At' },
        { field: 'updated_at', header: 'Updated At' }
    ];

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
                // Update existing supplier
                await axios.put(`/api/resources/suppliers/${selectedSupplier.supplier_id}`, formData);
                setError('');
                handleCloseDialog();
                await fetchSuppliers();
            } else {
                // Add new supplier
                const response = await axios.post('/api/resources/suppliers', formData);
                console.log('Supplier added successfully:', response.data);
                setError('');
                handleCloseDialog();
                await fetchSuppliers();
            }
        } catch (err: any) {
            console.error('Error saving supplier:', err);
            setError(err.response?.data?.message || 'Failed to save supplier');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (supplierId: number) => {
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            setLoading(true);
            try {
                await axios.delete(`/api/resources/suppliers/${supplierId}`);
                console.log('Supplier deleted successfully:', supplierId);
                setError('');
                await fetchSuppliers();
            } catch (err: any) {
                console.error('Error deleting supplier:', err);
                setError(err.response?.data?.message || 'Failed to delete supplier');
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

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedSuppliers(suppliers.map(supplier => supplier.supplier_id));
        } else {
            setSelectedSuppliers([]);
        }
    };

    const handleSelectSupplier = (supplierId: number) => {
        setSelectedSuppliers(prev => 
            prev.includes(supplierId)
                ? prev.filter(id => id !== supplierId)
                : [...prev, supplierId]
        );
    };

    const toggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
        if (selectionMode) {
            setSelectedSuppliers([]);
        }
    };

    const handleBulkArchive = () => {
        if (selectedSuppliers.length === 0) return;

        const selectedNames = suppliers
            .filter(supplier => selectedSuppliers.includes(supplier.supplier_id))
            .map(supplier => supplier.supplier_name)
            .join(", ");

        setSelectedSupplier({
            ...suppliers.find(supplier => supplier.supplier_id === selectedSuppliers[0])!,
            supplier_name: selectedNames
        });
        setIsArchiveModalOpen(true);
    };

    const handleRefresh = async () => {
        await fetchSuppliers();
        setSearchQuery('');
        setSuccessMessage('Data refreshed successfully');
    };

    return (
        <Box sx={{ p: 2, ml: { xs: 1, md: 35 }, mt: 0 }}>
            {/* Alerts */}
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

            {/* Controls */}
            <Box sx={{ 
                backgroundColor: 'white',
                padding: 2,
                borderRadius: 1,
                boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
                mb: 3,
                mt: 2
            }}>
                {/* Action Buttons Group */}
                <Box sx={{ 
                    display: 'flex', 
                    gap: 1,
                    mb: 2,
                    flexWrap: 'wrap',
                    justifyContent: 'space-between'
                }}>
                    {/* Left side buttons */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: '#01A768',
                                color: '#fff',
                                fontWeight: 'medium',
                                textTransform: 'none',
                                '&:hover': { backgroundColor: '#017F4A' }
                            }}
                            onClick={() => handleOpenDialog()}
                            startIcon={<AddIcon />}
                        >
                            Add Supplier
                        </Button>
                        <Button
                            variant="contained"
                            color="inherit"
                            onClick={() => setIsExportDialogOpen(true)}
                            startIcon={<FileDownloadIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            Export
                        </Button>
                        <Button
                            variant="contained"
                            color="inherit"
                            onClick={handleRefresh}
                            startIcon={<RefreshIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="contained"
                            color="inherit"
                            onClick={() => navigate('/admin/resources/archived-suppliers')}
                            startIcon={<ArchiveIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            View Archive
                        </Button>
                    </Box>

                    {/* Right side buttons */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            color={selectionMode ? "primary" : "inherit"}
                            onClick={toggleSelectionMode}
                            startIcon={<CheckBox />}
                            sx={{ textTransform: 'none' }}
                        >
                            Selection Mode {selectionMode ? 'ON' : 'OFF'}
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleBulkArchive}
                            disabled={selectedSuppliers.length === 0}
                            sx={{ textTransform: 'none' }}
                        >
                            Archive Selected ({selectedSuppliers.length})
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Search supplier name, contact, email, phone, or address"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel>Show entries</InputLabel>
                        <Select
                            value={rowsPerPage.toString()}
                            label="Show entries"
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setPage(0);
                            }}
                        >
                            <MenuItem value={10}>10 entries</MenuItem>
                            <MenuItem value={25}>25 entries</MenuItem>
                            <MenuItem value={50}>50 entries</MenuItem>
                            <MenuItem value={100}>100 entries</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            {/* Table section with selection checkboxes */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {selectionMode && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedSuppliers.length > 0 && selectedSuppliers.length < suppliers.length}
                                        checked={selectedSuppliers.length === suppliers.length && suppliers.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                            )}
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
                                    <TableRow 
                                        key={supplier.supplier_id}
                                        onClick={() => selectionMode && handleSelectSupplier(supplier.supplier_id)}
                                        sx={{
                                            backgroundColor: selectedSuppliers.includes(supplier.supplier_id) ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                                            cursor: selectionMode ? 'pointer' : 'default',
                                            '&:hover': {
                                                backgroundColor: selectionMode ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                                            }
                                        }}
                                    >
                                        {selectionMode && (
                                            <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedSuppliers.includes(supplier.supplier_id)}
                                                    onChange={() => handleSelectSupplier(supplier.supplier_id)}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell>{supplier.supplier_name}</TableCell>
                                        <TableCell>{supplier.contact_person}</TableCell>
                                        <TableCell>{supplier.email}</TableCell>
                                        <TableCell>{supplier.phone}</TableCell>
                                        <TableCell>{supplier.address}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    onClick={(e) => { e.stopPropagation(); handleOpenDialog(supplier); }}
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(supplier.supplier_id); }}
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
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={suppliers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

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

            {/* Add Export Dialog */}
            <ExportDialog
                open={isExportDialogOpen}
                onClose={() => setIsExportDialogOpen(false)}
                data={suppliers}
                columns={exportColumns}
                filename="suppliers"
            />
        </Box>
    );
};

export default SupplierManagement;
