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
    InputAdornment,
    Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArchiveIcon from '@mui/icons-material/Archive';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ExportDialog from '../../common/ExportDialog';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface Batch {
    batch_id: number;
    batch_number: string;
    order_number: string | null;
    supplier_id: number;
    supplier_name: string;
    received_date: string;
    expiry_date: string | null;
    notes: string | null;
    created_by: number;
    created_by_name: string;
    created_at: string;
    updated_at: string | null;
    is_active: boolean;
    product_count: number;
    total_quantity: number;
}

interface BatchItem {
    batch_item_id: number;
    batch_id: number;
    product_id: number;
    product_name: string;
    brand_name: string;
    barcode: string;
    category_name: string;
    quantity: number;
    unit_cost: number;
    expiry_date: string | null;
    created_at: string;
}

interface BatchDetails {
    batch: Batch;
    items: BatchItem[];
}

interface Supplier {
    supplier_id: number;
    supplier_name: string;
}

const BatchManagement: React.FC = () => {
    const navigate = useNavigate();
    const [batches, setBatches] = useState<Batch[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [formData, setFormData] = useState({
        batch_number: '',
        order_number: '',
        supplier_id: '',
        received_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        notes: ''
    });
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedBatches, setSelectedBatches] = useState<number[]>([]);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewBatchDetailsDialog, setViewBatchDetailsDialog] = useState(false);
    const [batchDetails, setBatchDetails] = useState<BatchDetails | null>(null);

    useEffect(() => {
        fetchBatches();
        fetchSuppliers();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/resources/batches');
            setBatches(response.data);
            setError(null);
        } catch (err: any) {
            setError('Failed to fetch batches');
            console.error('Error fetching batches:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await axios.get('/api/resources/suppliers');
            setSuppliers(response.data);
        } catch (err: any) {
            console.error('Error fetching suppliers:', err);
        }
    };

    const handleOpenDialog = (batch?: Batch) => {
        if (batch) {
            setSelectedBatch(batch);
            setFormData({
                batch_number: batch.batch_number,
                order_number: batch.order_number || '',
                supplier_id: batch.supplier_id.toString(),
                received_date: new Date(batch.received_date).toISOString().split('T')[0],
                expiry_date: batch.expiry_date ? new Date(batch.expiry_date).toISOString().split('T')[0] : '',
                notes: batch.notes || ''
            });
        } else {
            setSelectedBatch(null);
            setFormData({
                batch_number: '',
                order_number: '',
                supplier_id: '',
                received_date: new Date().toISOString().split('T')[0],
                expiry_date: '',
                notes: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedBatch(null);
    };

    const handleViewBatchDetails = async (batchId: number) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/resources/batches/${batchId}`);
            setBatchDetails(response.data);
            setViewBatchDetailsDialog(true);
        } catch (err: any) {
            console.error('Error fetching batch details:', err);
            setError(err.response?.data?.message || 'Failed to fetch batch details');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (selectedBatch) {
                // Update existing batch
                await axios.put(`/api/resources/batches/${selectedBatch.batch_id}`, formData);
                setSuccessMessage('Batch updated successfully');
                setTimeout(() => setSuccessMessage(null), 3000);
                handleCloseDialog();
                await fetchBatches();
            } else {
                // Add new batch
                const response = await axios.post('/api/resources/batches', formData);
                setSuccessMessage('Batch added successfully');
                setTimeout(() => setSuccessMessage(null), 3000);
                handleCloseDialog();
                await fetchBatches();
            }
        } catch (err: any) {
            console.error('Error saving batch:', err);
            setError(err.response?.data?.message || 'Failed to save batch');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async (batchId: number) => {
        if (window.confirm('Are you sure you want to archive this batch?')) {
            setLoading(true);
            try {
                await axios.post(`/api/resources/batches/${batchId}/archive`, {
                    archive_reason: 'User requested archive'
                });
                setSuccessMessage('Batch archived successfully');
                setTimeout(() => setSuccessMessage(null), 3000);
                await fetchBatches();
            } catch (err: any) {
                console.error('Error archiving batch:', err);
                setError(err.response?.data?.message || 'Failed to archive batch');
                setTimeout(() => setError(null), 3000);
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
            setSelectedBatches(batches.map(batch => batch.batch_id));
        } else {
            setSelectedBatches([]);
        }
    };

    const handleSelectBatch = (batchId: number) => {
        setSelectedBatches(prev => 
            prev.includes(batchId) 
                ? prev.filter(id => id !== batchId) 
                : [...prev, batchId]
        );
    };

    const toggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
        if (selectionMode) {
            setSelectedBatches([]);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const filteredBatches = batches.filter(batch => 
        batch.batch_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (batch.supplier_name && batch.supplier_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (batch.notes && batch.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const displayedBatches = filteredBatches
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Add export columns configuration
    const exportColumns = [
        { field: 'batch_number', header: 'Batch Number' },
        { field: 'order_number', header: 'Order Number' },
        { field: 'supplier_name', header: 'Supplier' },
        { field: 'received_date', header: 'Received Date' },
        { field: 'expiry_date', header: 'Expiry Date' },
        { field: 'notes', header: 'Notes' },
        { field: 'product_count', header: 'Product Count' },
        { field: 'total_quantity', header: 'Total Quantity' },
        { field: 'created_by_name', header: 'Created By' },
        { field: 'created_at', header: 'Created At' },
        { field: 'is_active', header: 'Status' }
    ];

    const renderBatchForm = () => (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Batch Number"
                        name="batch_number"
                        value={formData.batch_number}
                        onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                        margin="normal"
                        required
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Order Number"
                        name="order_number"
                        value={formData.order_number}
                        onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel id="supplier-label">Supplier</InputLabel>
                        <Select
                            labelId="supplier-label"
                            value={formData.supplier_id}
                            onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                            label="Supplier"
                        >
                            <MenuItem value="">
                                <em>Select a supplier</em>
                            </MenuItem>
                            {suppliers.map((supplier) => (
                                <MenuItem key={supplier.supplier_id} value={supplier.supplier_id.toString()}>
                                    {supplier.supplier_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Received Date"
                            value={formData.received_date ? new Date(formData.received_date) : null}
                            onChange={(date) => setFormData({
                                ...formData,
                                received_date: date ? date.toISOString().split('T')[0] : ''
                            })}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    margin: 'normal',
                                    required: true
                                }
                            }}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Expiry Date"
                            value={formData.expiry_date ? new Date(formData.expiry_date) : null}
                            onChange={(date) => setFormData({
                                ...formData,
                                expiry_date: date ? date.toISOString().split('T')[0] : ''
                            })}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    margin: 'normal'
                                }
                            }}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Notes"
                        name="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        margin="normal"
                        multiline
                        rows={4}
                    />
                </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleCloseDialog} sx={{ mr: 1 }}>
                    Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : (selectedBatch ? 'Update' : 'Add')}
                </Button>
            </Box>
        </Box>
    );

    const renderBatchDetailsDialog = () => (
        <Dialog
            open={viewBatchDetailsDialog}
            onClose={() => setViewBatchDetailsDialog(false)}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                Batch Details
                <IconButton
                    aria-label="close"
                    onClick={() => setViewBatchDetailsDialog(false)}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <DeleteIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {batchDetails && (
                    <>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Batch Information</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2">Batch Number</Typography>
                                    <Typography>{batchDetails.batch.batch_number}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2">Order Number</Typography>
                                    <Typography>{batchDetails.batch.order_number || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2">Supplier</Typography>
                                    <Typography>{batchDetails.batch.supplier_name}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2">Received Date</Typography>
                                    <Typography>
                                        {new Date(batchDetails.batch.received_date).toLocaleDateString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2">Expiry Date</Typography>
                                    <Typography>
                                        {batchDetails.batch.expiry_date 
                                            ? new Date(batchDetails.batch.expiry_date).toLocaleDateString() 
                                            : 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2">Notes</Typography>
                                    <Typography>{batchDetails.batch.notes || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2">Created By</Typography>
                                    <Typography>{batchDetails.batch.created_by_name}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2">Created At</Typography>
                                    <Typography>
                                        {new Date(batchDetails.batch.created_at).toLocaleString()}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>

                        <Typography variant="h6" gutterBottom>Products in Batch</Typography>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Barcode</TableCell>
                                        <TableCell align="right">Quantity</TableCell>
                                        <TableCell align="right">Unit Cost</TableCell>
                                        <TableCell>Expiry Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {batchDetails.items.length > 0 ? (
                                        batchDetails.items.map((item) => (
                                            <TableRow key={item.batch_item_id}>
                                                <TableCell>{item.product_name}</TableCell>
                                                <TableCell>{item.category_name || 'N/A'}</TableCell>
                                                <TableCell>{item.barcode}</TableCell>
                                                <TableCell align="right">{item.quantity}</TableCell>
                                                <TableCell align="right">
                                                    {item.unit_cost.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    {item.expiry_date 
                                                        ? new Date(item.expiry_date).toLocaleDateString() 
                                                        : 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                No products in this batch
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setViewBatchDetailsDialog(false)}>Close</Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <Box sx={{ p: 2, ml: { xs: 1, md: 35 }, mt: 0 }}>
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5">Batch Management</Typography>
                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={fetchBatches}
                            sx={{ mr: 1 }}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<FileDownloadIcon />}
                            onClick={() => setIsExportDialogOpen(true)}
                            sx={{ mr: 1 }}
                        >
                            Export
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                        >
                            Add Batch
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', mb: 2 }}>
                    <TextField
                        placeholder="Search batches..."
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={searchQuery}
                        onChange={handleSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ maxWidth: 500 }}
                    />
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {successMessage && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {successMessage}
                    </Alert>
                )}

                {loading && !batches.length ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {selectionMode && (
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={
                                                    selectedBatches.length > 0 && 
                                                    selectedBatches.length < batches.length
                                                }
                                                checked={
                                                    batches.length > 0 && 
                                                    selectedBatches.length === batches.length
                                                }
                                                onChange={handleSelectAll}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell>Batch Number</TableCell>
                                    <TableCell>Order Number</TableCell>
                                    <TableCell>Supplier</TableCell>
                                    <TableCell>Received Date</TableCell>
                                    <TableCell>Expiry Date</TableCell>
                                    <TableCell>Products</TableCell>
                                    <TableCell>Total Quantity</TableCell>
                                    <TableCell>Created By</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayedBatches.length > 0 ? (
                                    displayedBatches.map((batch) => (
                                        <TableRow key={batch.batch_id}>
                                            {selectionMode && (
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={selectedBatches.includes(batch.batch_id)}
                                                        onChange={() => handleSelectBatch(batch.batch_id)}
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell>{batch.batch_number}</TableCell>
                                            <TableCell>{batch.order_number || 'N/A'}</TableCell>
                                            <TableCell>{batch.supplier_name}</TableCell>
                                            <TableCell>
                                                {new Date(batch.received_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {batch.expiry_date 
                                                    ? new Date(batch.expiry_date).toLocaleDateString() 
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell>{batch.product_count}</TableCell>
                                            <TableCell>{batch.total_quantity}</TableCell>
                                            <TableCell>{batch.created_by_name}</TableCell>
                                            <TableCell>
                                                <Tooltip title="View Details">
                                                    <IconButton 
                                                        onClick={() => handleViewBatchDetails(batch.batch_id)}
                                                        size="small"
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton 
                                                        onClick={() => handleOpenDialog(batch)}
                                                        size="small"
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Archive">
                                                    <IconButton 
                                                        onClick={() => handleArchive(batch.batch_id)}
                                                        size="small"
                                                    >
                                                        <ArchiveIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell 
                                            colSpan={selectionMode ? 10 : 9} 
                                            align="center"
                                        >
                                            {searchQuery 
                                                ? 'No batches found matching your search' 
                                                : 'No batches available'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <TablePagination
                    component="div"
                    count={filteredBatches.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                />
            </Paper>

            {/* Add/Edit Batch Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selectedBatch ? 'Edit Batch' : 'Add New Batch'}
                </DialogTitle>
                <DialogContent>
                    {renderBatchForm()}
                </DialogContent>
            </Dialog>

            {/* Batch Details Dialog */}
            {renderBatchDetailsDialog()}

            {/* Export Dialog */}
            <ExportDialog
                open={isExportDialogOpen}
                onClose={() => setIsExportDialogOpen(false)}
                data={batches}
                columns={exportColumns}
                filename="batches_export"
            />
        </Box>
    );
}

export default BatchManagement;