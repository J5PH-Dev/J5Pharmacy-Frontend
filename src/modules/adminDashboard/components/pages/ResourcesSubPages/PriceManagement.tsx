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
    Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import axios from 'axios';

interface Product {
    product_id: number;
    barcode: string;
    name: string;
    brand_name: string;
    supplier_id: number;
    supplier_name: string;
    supplier_price: number;
    ceiling_price: number;
    markup_percentage: number;
    unit_price: number;
}

interface PriceHistory {
    history_id: number;
    product_id: number;
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
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
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
        setFormData({
            supplier_price: product.supplier_price,
            ceiling_price: product.ceiling_price,
            markup_percentage: product.markup_percentage
        });
        setOpenDialog(true);
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

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" component="h2">
                    Price Management
                </Typography>
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

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Barcode</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Brand</TableCell>
                            <TableCell>Supplier</TableCell>
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
                                <TableCell colSpan={9} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    No products found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((product) => (
                                    <TableRow key={product.product_id}>
                                        <TableCell>{product.barcode}</TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.brand_name}</TableCell>
                                        <TableCell>{product.supplier_name}</TableCell>
                                        <TableCell align="right">₱{product.supplier_price.toFixed(2)}</TableCell>
                                        <TableCell align="right">₱{product.ceiling_price.toFixed(2)}</TableCell>
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
                                        </TableCell>
                                    </TableRow>
                                ))
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

            {/* Edit Price Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Edit Price - {selectedProduct?.name}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Grid container spacing={2}>
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
                                    <TableCell align="right">Supplier Price</TableCell>
                                    <TableCell align="right">Ceiling Price</TableCell>
                                    <TableCell align="right">Markup %</TableCell>
                                    <TableCell align="right">Unit Price</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : priceHistory.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            No price history available
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    priceHistory.map((history) => (
                                        <TableRow key={history.history_id}>
                                            <TableCell>
                                                {new Date(history.created_at).toLocaleDateString()}
                                            </TableCell>
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
