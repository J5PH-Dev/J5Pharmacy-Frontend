import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack, TextField, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, IconButton, Alert, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, InputAdornment, TablePagination, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckBox from '@mui/icons-material/CheckBox';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BuildIcon from '@mui/icons-material/Build';
import axios from 'axios';
import * as XLSX from 'xlsx';

interface Product {
    id: number;
    name: string;
    brand_name: string;
    barcode: string;
    category_name: string;
    critical: number;
    price: number;
    branch_inventory: BranchInventory[];
    created_at: string;
    updated_at: string;
}

interface BranchInventory {
    branch_id: number;
    branch_name: string;
    stock: number;
    expiryDate: string | null;
}

interface Branch {
    branch_id: number;
    branch_name: string;
}

interface ResolveDialogProps {
    open: boolean;
    onClose: () => void;
    products: Product[];
    branches: Branch[];
    onSave: (updatedInventory: any[]) => void;
}

const ResolveDialog: React.FC<ResolveDialogProps> = ({ open, onClose, products, branches, onSave }) => {
    const [inventory, setInventory] = useState<any[]>([]);

    useEffect(() => {
        // Initialize inventory state with current values
        const initialInventory = products.map(product => ({
            product_id: product.id,
            product_name: product.name,
            critical: product.critical,
            branches: product.branch_inventory.map(bi => ({
                branch_id: bi.branch_id,
                branch_name: bi.branch_name,
                stock: bi.stock,
                expiryDate: bi.expiryDate
            }))
        }));
        setInventory(initialInventory);
    }, [products]);

    const handleStockChange = (productIndex: number, branchIndex: number, value: string) => {
        const newInventory = [...inventory];
        newInventory[productIndex].branches[branchIndex].stock = parseInt(value) || 0;
        setInventory(newInventory);
    };

    const handleExpiryChange = (productIndex: number, branchIndex: number, value: string) => {
        const newInventory = [...inventory];
        newInventory[productIndex].branches[branchIndex].expiryDate = value;
        setInventory(newInventory);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle>Resolve Product Shortage</DialogTitle>
            <DialogContent>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Product</TableCell>
                                <TableCell>Critical Level</TableCell>
                                {branches.map(branch => (
                                    <React.Fragment key={branch.branch_id}>
                                        <TableCell>{branch.branch_name} Stock</TableCell>
                                        <TableCell>{branch.branch_name} Expiry</TableCell>
                                    </React.Fragment>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {inventory.map((item, productIndex) => (
                                <TableRow key={item.product_id}>
                                    <TableCell>{item.product_name}</TableCell>
                                    <TableCell>{item.critical}</TableCell>
                                    {item.branches.map((branch: any, branchIndex: number) => (
                                        <React.Fragment key={branch.branch_id}>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    value={branch.stock}
                                                    onChange={(e) => handleStockChange(productIndex, branchIndex, e.target.value)}
                                                    size="small"
                                                    error={branch.stock <= item.critical}
                                                    helperText={branch.stock <= item.critical ? 'Below critical level' : ''}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="date"
                                                    value={branch.expiryDate?.split('T')[0] || ''}
                                                    onChange={(e) => handleExpiryChange(productIndex, branchIndex, e.target.value)}
                                                    size="small"
                                                />
                                            </TableCell>
                                        </React.Fragment>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={() => onSave(inventory)} variant="contained" color="primary">
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const MedicineShortage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [categories, setCategories] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' }>({
        key: 'name',
        direction: 'asc'
    });
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
    const [selectedForResolve, setSelectedForResolve] = useState<Product[]>([]);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [exportFileName, setExportFileName] = useState('critical_products');

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBranches();
    }, [sortConfig]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/admin/inventory/critical-products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching critical products:', error);
            setError('Failed to fetch critical products');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/admin/inventory/categories');
            const uniqueCategories = response.data
                .map((cat: { name: string }) => cat.name)
                .filter((name: string, index: number, self: string[]) => self.indexOf(name) === index);
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to fetch categories');
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await axios.get('/admin/inventory/branches');
            setBranches(response.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
            setError('Failed to fetch branches');
        }
    };

    const handleBreadcrumbClick = (path: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(path);
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        setPage(0);
    };

    const handleCategoryChange = (event: SelectChangeEvent) => {
        setCategoryFilter(event.target.value);
        setPage(0);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: SelectChangeEvent) => {
        const newRowsPerPage = event.target.value === 'all' ? products.length : parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    const handleSort = (key: keyof Product) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            await fetchProducts();
            await fetchCategories();
            await fetchBranches();
            setSelectedItems([]);
            setSearchQuery('');
            setCategoryFilter('All');
            setPage(0);
            setSuccessMessage('Data refreshed successfully');
        } catch (error) {
            console.error('Error refreshing data:', error);
            setError('Failed to refresh data');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        if (isSelectionMode) {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (id: number) => {
        if (!isSelectionMode) return;
        setSelectedItems(prev => 
            prev.includes(id)
                ? prev.filter(itemId => itemId !== id)
                : [...prev, id]
        );
    };

    const processedProducts = useMemo(() => {
        let filtered = [...products];

        if (searchQuery) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.barcode.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (categoryFilter !== 'All') {
            filtered = filtered.filter(product =>
                product.category_name === categoryFilter
            );
        }

        filtered.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [products, searchQuery, categoryFilter, sortConfig]);

    const paginatedProducts = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return processedProducts.slice(startIndex, startIndex + rowsPerPage);
    }, [processedProducts, page, rowsPerPage]);

    const handleViewDetails = (product: Product) => {
        navigate(`/manager/inventory/view-medicines-description/${product.barcode}`);
    };

    const handleResolve = (product: Product) => {
        setSelectedForResolve([product]);
        setIsResolveDialogOpen(true);
    };

    const handleResolveSelected = () => {
        const selectedProducts = products.filter(product => selectedItems.includes(product.id));
        setSelectedForResolve(selectedProducts);
        setIsResolveDialogOpen(true);
    };

    const handleSaveResolution = async (updatedInventory: any[]) => {
        try {
            // Update each product's inventory
            await Promise.all(updatedInventory.map(async (item) => {
                await Promise.all(item.branches.map(async (branch: any) => {
                    await axios.post('/admin/inventory/update-branch-inventory', {
                        branchId: branch.branch_id,
                        productId: item.product_id,
                        stock: branch.stock,
                        expiryDate: branch.expiryDate
                    });
                }));
            }));

            setSuccessMessage('Inventory updated successfully');
            setIsResolveDialogOpen(false);
            await fetchProducts(); // Refresh the data
        } catch (error) {
            console.error('Error updating inventory:', error);
            setError('Failed to update inventory');
        }
    };

    const handleExport = () => {
        const exportData = processedProducts.map(product => {
            const baseData: { [key: string]: string | number } = {
                'Product Name': product.name,
                'Brand Name': product.brand_name,
                'Barcode': product.barcode,
                'Category': product.category_name,
                'Critical Level': product.critical
            };

            // Add branch-specific data
            product.branch_inventory.forEach(bi => {
                baseData[`${bi.branch_name} Stock`] = bi.stock;
                baseData[`${bi.branch_name} Expiry`] = bi.expiryDate || 'N/A';
            });

            return baseData;
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Critical Products');
        XLSX.writeFile(wb, `${exportFileName}.xlsx`);
        setIsExportDialogOpen(false);
    };

    return (
        <Box sx={{ p: 0, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>
            {error && (
                <Alert 
                    severity="error" 
                    sx={{ mb: 2 }}
                    onClose={() => setError(null)}
                >
                    {error}
                </Alert>
            )}
            {successMessage && (
                <Alert 
                    severity="success" 
                    sx={{ mb: 2 }}
                    onClose={() => setSuccessMessage(null)}
                >
                    {successMessage}
                </Alert>
            )}

            <Box sx={{ 
                backgroundColor: 'white',
                padding: 2,
                borderRadius: 1,
                boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
                mb: 3
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    mb: 2,
                    flexWrap: 'wrap',
                    gap: 2
                }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
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
                            color="primary"
                            onClick={() => setIsExportDialogOpen(true)}
                            sx={{ textTransform: 'none' }}
                        >
                            Export
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            color={isSelectionMode ? "primary" : "inherit"}
                            onClick={toggleSelectionMode}
                            startIcon={<CheckBox />}
                            sx={{ textTransform: 'none' }}
                        >
                            Selection Mode {isSelectionMode ? 'ON' : 'OFF'}
                        </Button>
                        <Button
                            variant="contained"
                            color="warning"
                            onClick={handleResolveSelected}
                            startIcon={<BuildIcon />}
                            sx={{ textTransform: 'none' }}
                            disabled={!isSelectionMode || selectedItems.length === 0}
                        >
                            Resolve Selected
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ 
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    alignItems: { xs: 'stretch', md: 'center' },
                    justifyContent: 'space-between'
                }}>
                    <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                <TextField
                            label="Search Product, Brand, Barcode"
                    value={searchQuery}
                    onChange={handleSearch}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                                minWidth: { xs: '100%', md: '300px' },
                        backgroundColor: '#fff',
                    }}
                />

                        <FormControl sx={{ minWidth: { xs: '100%', md: '200px' } }}>
                            <InputLabel>Category</InputLabel>
                    <Select
                                value={categoryFilter}
                                label="Category"
                                onChange={handleCategoryChange}
                            >
                                <MenuItem value="All">All</MenuItem>
                                {categories.map((category: string) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

                    <FormControl sx={{ minWidth: { xs: '100%', md: '150px' } }}>
                        <InputLabel>Show entries</InputLabel>
                        <Select
                            value={rowsPerPage.toString()}
                            onChange={handleChangeRowsPerPage}
                            label="Show entries"
                        >
                            <MenuItem value={10}>10 entries</MenuItem>
                            <MenuItem value={25}>25 entries</MenuItem>
                            <MenuItem value={50}>50 entries</MenuItem>
                            <MenuItem value={100}>100 entries</MenuItem>
                            <MenuItem value="all">Show all</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {isSelectionMode && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedItems.length === paginatedProducts.length}
                                        indeterminate={selectedItems.length > 0 && selectedItems.length < paginatedProducts.length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedItems(paginatedProducts.map(product => product.id));
                                            } else {
                                                setSelectedItems([]);
                                            }
                                        }}
                                />
                            </TableCell>
                            )}
                            <TableCell
                                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                onClick={() => handleSort('name')}
                            >
                                Product Name
                                {sortConfig.key === 'name' && (
                                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                )}
                            </TableCell>
                            <TableCell
                                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                onClick={() => handleSort('brand_name')}
                            >
                                Brand Name
                                {sortConfig.key === 'brand_name' && (
                                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                )}
                            </TableCell>
                            <TableCell
                                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                onClick={() => handleSort('barcode')}
                            >
                                Barcode
                                {sortConfig.key === 'barcode' && (
                                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                )}
                            </TableCell>
                            <TableCell
                                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                onClick={() => handleSort('category_name')}
                            >
                                Category
                                {sortConfig.key === 'category_name' && (
                                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                )}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Critical Level</TableCell>
                            {branches.map(branch => (
                                <TableCell key={branch.branch_id} sx={{ fontWeight: 'bold' }}>
                                    {branch.branch_name} Stock
                            </TableCell>
                            ))}
                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedProducts.map((product) => (
                            <TableRow
                                key={product.id}
                                sx={{
                                    backgroundColor: '#FFEDED',
                                    '&:hover': {
                                        backgroundColor: '#FFE6E6'
                                    }
                                }}
                            >
                                {isSelectionMode && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                            checked={selectedItems.includes(product.id)}
                                            onChange={() => handleSelectItem(product.id)}
                                    />
                                </TableCell>
                                )}
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.brand_name}</TableCell>
                                <TableCell>{product.barcode}</TableCell>
                                <TableCell>{product.category_name}</TableCell>
                                <TableCell>{product.critical}</TableCell>
                                {branches.map(branch => {
                                    const branchInventory = product.branch_inventory.find(
                                        bi => bi.branch_id === branch.branch_id
                                    );
                                    return (
                                        <TableCell 
                                            key={branch.branch_id}
                                            sx={{
                                                color: branchInventory && branchInventory.stock <= product.critical ? 'red' : 'inherit'
                                            }}
                                        >
                                            {branchInventory ? branchInventory.stock : 'N/A'}
                                </TableCell>
                                    );
                                })}
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleViewDetails(product)}
                                        title="View Details"
                                    >
                                        <VisibilityIcon />
                                        </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleResolve(product)}
                                        title="Resolve"
                                        color="warning"
                                    >
                                        <BuildIcon />
                                        </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 2 }}>
                <TablePagination
                    component="div"
                    count={processedProducts.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[]}
                />
                    </Box>

            <ResolveDialog
                open={isResolveDialogOpen}
                onClose={() => setIsResolveDialogOpen(false)}
                products={selectedForResolve}
                branches={branches}
                onSave={handleSaveResolution}
            />

            {/* Export Dialog */}
            <Dialog open={isExportDialogOpen} onClose={() => setIsExportDialogOpen(false)}>
                <DialogTitle>Export Critical Products</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="File Name"
                            value={exportFileName}
                            onChange={(e) => setExportFileName(e.target.value)}
                fullWidth
                            helperText="The file will be exported as an Excel file (.xlsx)"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsExportDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleExport} variant="contained" color="primary">
                        Export
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MedicineShortage;