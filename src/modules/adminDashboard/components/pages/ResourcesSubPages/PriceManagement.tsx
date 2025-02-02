import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    IconButton,
    Tooltip,
    Grid,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';

interface Supplier {
    supplier_id: number;
    supplier_name: string;
    supplier_price: number;
    ceiling_price: number;
    is_preferred: boolean;
}

interface Product {
    product_id: number;
    barcode: string;
    name: string;
    brand_name: string;
    suppliers: Supplier[];
    current_supplier_id: number;
    markup_percentage: number;
    unit_price: number;
}

interface PriceHistory {
    history_id: number;
    product_id: number;
    supplier_id: number;
    supplier_name: string;
    supplier_price: number;
    ceiling_price: number;
    unit_price: number;
    markup_percentage: number;
    created_at: string;
}

const PriceManagement: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
    const [openSuppliersDialog, setOpenSuppliersDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        supplier_id: 0,
        supplier_price: 0,
        ceiling_price: 0,
        markup_percentage: 0
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/resources/pricing');
            setProducts(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch products');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPriceHistory = async (productId: number) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/resources/pricing/${productId}/history`);
            setPriceHistory(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch price history');
            console.error('Error fetching price history:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (product: Product) => {
        setSelectedProduct(product);
        const currentSupplier = product.suppliers.find(s => s.supplier_id === product.current_supplier_id);
        setFormData({
            supplier_id: product.current_supplier_id,
            supplier_price: currentSupplier?.supplier_price || 0,
            ceiling_price: currentSupplier?.ceiling_price || 0,
            markup_percentage: product.markup_percentage
        });
        setOpenDialog(true);
    };

    const handleOpenSuppliersDialog = (product: Product) => {
        setSelectedProduct(product);
        setOpenSuppliersDialog(true);
    };

    const handleOpenHistoryDialog = async (product: Product) => {
        setSelectedProduct(product);
        await fetchPriceHistory(product.product_id);
        setOpenHistoryDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedProduct(null);
        setFormData({
            supplier_id: 0,
            supplier_price: 0,
            ceiling_price: 0,
            markup_percentage: 0
        });
    };

    const handleCloseHistoryDialog = () => {
        setOpenHistoryDialog(false);
        setSelectedProduct(null);
        setPriceHistory([]);
    };

    const handleCloseSuppliersDialog = () => {
        setOpenSuppliersDialog(false);
        setSelectedProduct(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        setLoading(true);
        try {
            await axios.put(`/api/resources/pricing/${selectedProduct.product_id}`, formData);
            fetchProducts();
            handleCloseDialog();
            setSuccess('Price updated successfully');
            setError('');
        } catch (err) {
            setError('Failed to update price');
            console.error('Error updating price:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSupplierChange = (event: any) => {
        const supplierId = event.target.value;
        if (selectedProduct) {
            const supplier = selectedProduct.suppliers.find(s => s.supplier_id === supplierId);
            if (supplier) {
                setFormData({
                    ...formData,
                    supplier_id: supplierId,
                    supplier_price: supplier.supplier_price,
                    ceiling_price: supplier.ceiling_price
                });
            }
        }
    };

    const getSupplierCount = (product: Product) => {
        return product.suppliers.length;
    };

    const getCurrentSupplierName = (product: Product) => {
        const supplier = product.suppliers.find(s => s.supplier_id === product.current_supplier_id);
        return supplier?.supplier_name || 'No supplier';
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ p: 3, ml: { xs: 1, md: 35 }, mt: 4 }}>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <TextField
                    size="small"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: 300 }}
                />
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Paper sx={{ width: '100%', overflow: 'hidden', mb: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Barcode</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Brand</TableCell>
                                <TableCell>Suppliers</TableCell>
                                <TableCell>Current Supplier</TableCell>
                                <TableCell align="right">Supplier Price</TableCell>
                                <TableCell align="right">Ceiling Price</TableCell>
                                <TableCell align="right">Markup %</TableCell>
                                <TableCell align="right">Unit Price</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center">
                                        No products found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProducts
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((product) => {
                                        const supplierCount = getSupplierCount(product);
                                        const currentSupplier = product.suppliers.find(s => s.supplier_id === product.current_supplier_id);
                                        return (
                                            <TableRow key={product.product_id}>
                                                <TableCell>{product.barcode}</TableCell>
                                                <TableCell>{product.name}</TableCell>
                                                <TableCell>{product.brand_name}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={`${supplierCount} supplier${supplierCount !== 1 ? 's' : ''}`}
                                                        onClick={() => handleOpenSuppliersDialog(product)}
                                                        color={supplierCount > 1 ? "primary" : "default"}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>{getCurrentSupplierName(product)}</TableCell>
                                                <TableCell align="right">
                                                    ₱{currentSupplier?.supplier_price.toFixed(2) || '0.00'}
                                                </TableCell>
                                                <TableCell align="right">
                                                    ₱{currentSupplier?.ceiling_price.toFixed(2) || '0.00'}
                                                </TableCell>
                                                <TableCell align="right">{product.markup_percentage}%</TableCell>
                                                <TableCell align="right">₱{product.unit_price.toFixed(2)}</TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="Edit Price">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenDialog(product)}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Price History">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenHistoryDialog(product)}
                                                        >
                                                            <HistoryIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Supplier Details">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenSuppliersDialog(product)}
                                                        >
                                                            <InfoIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredProducts.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableContainer>
            </Paper>

            {/* Edit Price Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Edit Price - {selectedProduct?.name}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Select Supplier</InputLabel>
                                    <Select
                                        value={formData.supplier_id}
                                        onChange={handleSupplierChange}
                                        label="Select Supplier"
                                    >
                                        {selectedProduct?.suppliers.map(supplier => (
                                            <MenuItem key={supplier.supplier_id} value={supplier.supplier_id}>
                                                {supplier.supplier_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Supplier Price"
                                    type="number"
                                    fullWidth
                                    required
                                    value={formData.supplier_price}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        supplier_price: parseFloat(e.target.value)
                                    })}
                                    inputProps={{ min: 0, step: 0.01 }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Ceiling Price"
                                    type="number"
                                    fullWidth
                                    required
                                    value={formData.ceiling_price}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        ceiling_price: parseFloat(e.target.value)
                                    })}
                                    inputProps={{ min: 0, step: 0.01 }}
                                    error={formData.ceiling_price <= formData.supplier_price}
                                    helperText={formData.ceiling_price <= formData.supplier_price ? 
                                        "Ceiling price must be greater than supplier price" : ""}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Markup Percentage"
                                    type="number"
                                    fullWidth
                                    required
                                    value={formData.markup_percentage}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        markup_percentage: parseFloat(e.target.value)
                                    })}
                                    inputProps={{ min: 0, step: 0.1 }}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading || formData.ceiling_price <= formData.supplier_price}
                            sx={{
                                backgroundColor: '#1B3E2D',
                                '&:hover': {
                                    backgroundColor: '#2D5741',
                                },
                            }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Suppliers Dialog */}
            <Dialog open={openSuppliersDialog} onClose={handleCloseSuppliersDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    Supplier Details - {selectedProduct?.name}
                </DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Supplier Name</TableCell>
                                    <TableCell align="right">Supplier Price</TableCell>
                                    <TableCell align="right">Ceiling Price</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedProduct?.suppliers.map((supplier) => (
                                    <TableRow key={supplier.supplier_id}>
                                        <TableCell>{supplier.supplier_name}</TableCell>
                                        <TableCell align="right">₱{supplier.supplier_price.toFixed(2)}</TableCell>
                                        <TableCell align="right">₱{supplier.ceiling_price.toFixed(2)}</TableCell>
                                        <TableCell align="center">
                                            {supplier.is_preferred ? (
                                                <Chip label="Current Supplier" color="primary" size="small" />
                                            ) : (
                                                <Chip label="Alternative" size="small" />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSuppliersDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Price History Dialog */}
            <Dialog open={openHistoryDialog} onClose={handleCloseHistoryDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    Price History - {selectedProduct?.name}
                </DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Supplier</TableCell>
                                    <TableCell align="right">Supplier Price</TableCell>
                                    <TableCell align="right">Ceiling Price</TableCell>
                                    <TableCell align="right">Markup %</TableCell>
                                    <TableCell align="right">Unit Price</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : priceHistory.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            No price history available
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    priceHistory.map((history) => (
                                        <TableRow key={history.history_id}>
                                            <TableCell>
                                                {new Date(history.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>{history.supplier_name}</TableCell>
                                            <TableCell align="right">
                                                ₱{history.supplier_price.toFixed(2)}
                                            </TableCell>
                                            <TableCell align="right">
                                                ₱{history.ceiling_price.toFixed(2)}
                                            </TableCell>
                                            <TableCell align="right">
                                                {history.markup_percentage}%
                                            </TableCell>
                                            <TableCell align="right">
                                                ₱{history.unit_price.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseHistoryDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PriceManagement;
