import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack, TextField, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, IconButton, Alert, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, InputAdornment, TablePagination, Checkbox, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RestoreIcon from '@mui/icons-material/Restore';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckBox from '@mui/icons-material/CheckBox';
import InventoryIcon from '@mui/icons-material/Inventory';
import axios from 'axios';
import ExportDialog from '../../common/ExportDialog';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowBack from '@mui/icons-material/ArrowBack';

interface ApiError {
    message: string;
    error?: any;
}

interface ArchivedProduct {
    product_id: number;
    name: string;
    brand_name: string;
    barcode: string;
    category_name: string;
    price: string;
    archived_by_name: string;
    archived_at: string;
    archive_reason: string;
    branch_inventory?: BranchInventory[];
    [key: string]: string | number | BranchInventory[] | undefined;
}

interface SortConfig {
    key: keyof ArchivedProduct;
    direction: 'asc' | 'desc';
}

interface User {
    employeeId: string;
    name: string;
    id: string;
}

interface Product {
    barcode: string;
    name: string;
    brand_name: string;
    category: string;
    category_name: string;
    price: number;
    stock: number;
    createdAt: string;
    updatedAt: string;
    archivedAt: string;
    archived_by_name: string;
    archive_reason: string;
    product_id: number;
}

interface Branch {
    branch_id: number;
    branch_name: string;
}

interface BranchInventory {
    branch_id: number;
    stock: number;
    expiryDate: string | null;
}

const ArchivedProductsPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [archivedProducts, setArchivedProducts] = useState<ArchivedProduct[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [categories, setCategories] = useState<string[]>([]);
    const [dateFilter, setDateFilter] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'archived_at', direction: 'desc' });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [tempDateFilter, setTempDateFilter] = useState({ startDate: '', endDate: '' });

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) {
                    setError('No user information found');
                    return;
                }

                const userData = JSON.parse(userStr);
                console.log('User data from localStorage:', userData);
                setCurrentUser({
                    employeeId: userData.employee_id || userData.employeeId,
                    name: userData.name,
                    id: userData.employee_id || userData.employeeId
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Error fetching user information');
            }
        };

        fetchCurrentUser();
    }, []);

    useEffect(() => {
        fetchArchivedProducts();
        fetchCategories();
        fetchBranches();
    }, [sortConfig]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/admin/inventory/categories');
            const uniqueCategories = response.data
                .map((cat: { name: string }) => cat.name)
                .filter((name: string, index: number, self: string[]) => self.indexOf(name) === index);
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Error fetching categories');
        }
    };

    const fetchArchivedProducts = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/admin/inventory/archived-products');
            setArchivedProducts(response.data);
        } catch (error) {
            const apiError = error as ApiError;
            console.error('Error fetching archived products:', apiError);
            setError(apiError.message || 'Error fetching archived products');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestoreProduct = async (productId: number) => {
        if (!currentUser) {
            setError('No user information available. Please try again.');
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(`/admin/inventory/restore-product/${productId}`, {
                employee_id: currentUser.employeeId,
                userName: currentUser.name
            });
            setSuccessMessage('Product restored successfully');
            await fetchArchivedProducts();
        } catch (error) {
            console.error('Error restoring product:', error);
            setError('Failed to restore product. Please try again.');
        } finally {
            setIsLoading(false);
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
        const newRowsPerPage = event.target.value === 'all' ? archivedProducts.length : parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    const handleSort = (key: keyof ArchivedProduct) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        if (isSelectionMode) {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (barcode: string) => {
        if (!isSelectionMode) return;
        setSelectedItems(prev => 
            prev.includes(barcode)
                ? prev.filter(id => id !== barcode)
                : [...prev, barcode]
        );
    };

    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            await fetchArchivedProducts();
            await fetchCategories();
            await fetchBranches();
            setSelectedItems([]);
            setSearchQuery('');
            setCategoryFilter('All');
            setDateFilter({ startDate: '', endDate: '' });
            setTempDateFilter({ startDate: '', endDate: '' });
            setShowDateFilter(false);
            setPage(0);
            setSuccessMessage('Data refreshed successfully');
        } catch (error) {
            console.error('Error refreshing data:', error);
            setError('Failed to refresh data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportClick = () => {
        setIsExportDialogOpen(true);
    };

    const handleExportClose = () => {
        setIsExportDialogOpen(false);
    };

    const exportColumns = useMemo(() => {
        const baseColumns = [
            { field: 'name', header: 'Product Name' },
            { field: 'brand_name', header: 'Brand Name' },
            { field: 'barcode', header: 'Barcode' },
            { field: 'category_name', header: 'Category' },
            { field: 'price', header: 'Price' },
            { field: 'archived_by_name', header: 'Archived By' },
            { field: 'archived_at', header: 'Archived At' },
            { field: 'archive_reason', header: 'Reason' }
        ];

        branches.forEach(branch => {
            baseColumns.push(
                { field: `branch_${branch.branch_id}_stock`, header: `${branch.branch_name} Stock` },
                { field: `branch_${branch.branch_id}_expiry`, header: `${branch.branch_name} Expiry` }
            );
        });

        return baseColumns;
    }, [branches]);

    const handleDateFilterChange = (field: 'startDate' | 'endDate', value: string) => {
        setTempDateFilter(prev => ({ ...prev, [field]: value }));
    };

    const handleApplyDateFilter = () => {
        setDateFilter(tempDateFilter);
        setShowDateFilter(false);
    };

    const handleClearDateFilter = () => {
        setTempDateFilter({ startDate: '', endDate: '' });
        setDateFilter({ startDate: '', endDate: '' });
        setShowDateFilter(false);
    };

    const processedProducts = useMemo(() => {
        let filtered = [...archivedProducts];

        if (searchQuery) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.barcode.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (categoryFilter !== 'All') {
            filtered = filtered.filter(product =>
                product.category_name.toLowerCase() === categoryFilter.toLowerCase()
            );
        }

        if (dateFilter.startDate || dateFilter.endDate) {
            filtered = filtered.filter(product => {
                const productDate = new Date(product.archived_at);
                const start = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
                const end = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

                if (start && end) {
                    return productDate >= start && productDate <= end;
                } else if (start) {
                    return productDate >= start;
                } else if (end) {
                    return productDate <= end;
                }
                return true;
            });
        }

        filtered = filtered.map(product => {
            const enhancedProduct = { ...product };
            
            branches.forEach(branch => {
                const branchInventory = product.branch_inventory?.find((bi: BranchInventory) => bi.branch_id === branch.branch_id);
                enhancedProduct[`branch_${branch.branch_id}_stock`] = branchInventory?.stock?.toString() || '0';
                enhancedProduct[`branch_${branch.branch_id}_expiry`] = branchInventory?.expiryDate || 'N/A';
            });

            return enhancedProduct;
        });

        filtered.sort((a, b) => {
            const aValue = a[sortConfig.key] as string | number | undefined;
            const bValue = b[sortConfig.key] as string | number | undefined;
            
            const defaultValue = sortConfig.direction === 'asc' ? '' : 'zzz';
            const aFinal = aValue ?? defaultValue;
            const bFinal = bValue ?? defaultValue;
            
            if (typeof aFinal === 'number' && typeof bFinal === 'number') {
                return sortConfig.direction === 'asc' ? aFinal - bFinal : bFinal - aFinal;
            }
            
            const aStr = String(aFinal).toLowerCase();
            const bStr = String(bFinal).toLowerCase();
            
            if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [archivedProducts, searchQuery, categoryFilter, dateFilter, sortConfig, branches]);

    const paginatedProducts = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return processedProducts.slice(startIndex, startIndex + rowsPerPage);
    }, [processedProducts, page, rowsPerPage]);

    const handleRestoreSelected = async () => {
        if (!currentUser) {
            setError('No user information available. Please try again.');
            return;
        }

        setIsLoading(true);
        let successCount = 0;
        let failedProducts: string[] = [];

        try {
            for (const barcode of selectedItems) {
                const product = archivedProducts.find(p => p.barcode === barcode);
                if (!product) continue;

                try {
                    await axios.post(`/admin/inventory/restore-product/${product.product_id}`, {
                        employee_id: currentUser.employeeId,
                        userName: currentUser.name
                    });
                    successCount++;
                } catch (error) {
                    console.error(`Error restoring product ${barcode}:`, error);
                    failedProducts.push(product.name);
                }
            }

            if (successCount > 0) {
                setSuccessMessage(`Successfully restored ${successCount} product${successCount > 1 ? 's' : ''}`);
                await fetchArchivedProducts();
            }
            
            if (failedProducts.length > 0) {
                setError(`Failed to restore the following products: ${failedProducts.join(', ')}`);
            }

            setSelectedItems([]);
            setIsSelectionMode(false);
        } catch (error) {
            console.error('Error in restore process:', error);
            setError('An error occurred during the restore process. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleItemSelect = (barcode: string) => {
        if (!isSelectionMode) return;
        setSelectedItems(prev => 
            prev.includes(barcode)
                ? prev.filter(id => id !== barcode)
                : [...prev, barcode]
        );
    };

    const fetchBranches = async () => {
        try {
            const response = await axios.get('/admin/inventory/branches');
            setBranches(response.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
            setError('Failed to fetch branches data');
        }
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
                mb: 3,
                mt: 2,
                position: 'relative'
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
                            onClick={handleExportClick}
                            startIcon={<FileDownloadIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            Export
                        </Button>

                        <Button
                            variant="contained"
                            color="inherit"
                            onClick={() => navigate('/manager/inventory/view-medicines-available')}
                            startIcon={<InventoryIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            View Products
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
                            color="primary"
                            onClick={handleRestoreSelected}
                            startIcon={<RestoreIcon />}
                            disabled={selectedItems.length === 0}
                            sx={{ textTransform: 'none' }}
                        >
                            Restore Selected ({selectedItems.length})
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

                        <Button
                            variant="outlined"
                            onClick={() => setShowDateFilter(!showDateFilter)}
                            sx={{ minWidth: { xs: '100%', md: 'auto' } }}
                        >
                            {dateFilter.startDate || dateFilter.endDate ? 'Date Filter Active' : 'Date Filter'}
                        </Button>
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

                {showDateFilter && (
                    <Paper sx={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        mt: 1,
                        p: 2,
                        zIndex: 1000,
                        minWidth: 300,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}>
                        <Typography variant="subtitle2">Date Filter</Typography>
                        <TextField
                            label="Start Date"
                            type="date"
                            value={tempDateFilter.startDate}
                            onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                        <TextField
                            label="End Date"
                            type="date"
                            value={tempDateFilter.endDate}
                            onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button
                                size="small"
                                onClick={handleClearDateFilter}
                            >
                                Clear
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleApplyDateFilter}
                            >
                                Apply
                            </Button>
                        </Box>
                    </Paper>
                )}
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
                                                setSelectedItems(paginatedProducts.map(product => product.barcode));
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
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Product Name
                                    {sortConfig.key === 'name' && (
                                        sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell 
                                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                onClick={() => handleSort('brand_name')}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Brand Name
                                    {sortConfig.key === 'brand_name' && (
                                        sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell 
                                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                onClick={() => handleSort('barcode')}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Barcode
                                    {sortConfig.key === 'barcode' && (
                                        sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell 
                                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                onClick={() => handleSort('category_name')}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Category
                                    {sortConfig.key === 'category_name' && (
                                        sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell 
                                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                onClick={() => handleSort('price')}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Price
                                    {sortConfig.key === 'price' && (
                                        sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell 
                                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                onClick={() => handleSort('archived_by_name')}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Archived By
                                    {sortConfig.key === 'archived_by_name' && (
                                        sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell 
                                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                onClick={() => handleSort('archived_at')}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Archived At
                                    {sortConfig.key === 'archived_at' && (
                                        sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell 
                                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                onClick={() => handleSort('archive_reason')}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Reason
                                    {sortConfig.key === 'archive_reason' && (
                                        sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : paginatedProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    No archived products found
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedProducts.map((product) => (
                                <TableRow key={product.barcode}>
                                    {isSelectionMode && (
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedItems.includes(product.barcode)}
                                                onChange={() => handleItemSelect(product.barcode)}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.brand_name}</TableCell>
                                    <TableCell>{product.barcode}</TableCell>
                                    <TableCell>{product.category_name}</TableCell>
                                    <TableCell>₱{parseFloat(product.price).toFixed(2)}</TableCell>
                                    <TableCell>{product.archived_by_name}</TableCell>
                                    <TableCell>{new Date(product.archived_at).toLocaleDateString()}</TableCell>
                                    <TableCell>{product.archive_reason}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRestoreProduct(product.product_id);
                                            }}
                                            color="primary"
                                            title="Restore product"
                                        >
                                            <RestoreIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={processedProducts.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[]}
            />

            <ExportDialog
                open={isExportDialogOpen}
                onClose={handleExportClose}
                data={processedProducts}
                columns={exportColumns}
                filename="archived_products"
            />
        </Box>
    );
};

export default ArchivedProductsPage; 