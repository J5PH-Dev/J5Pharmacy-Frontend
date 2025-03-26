import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Breadcrumbs, Link, Button, Stack, TextField,
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    Paper, IconButton, Alert, FormControl, InputLabel, Select, MenuItem,
    SelectChangeEvent, InputAdornment, TablePagination, Checkbox, Dialog,
    DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckBox from '@mui/icons-material/CheckBox';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArchiveIcon from '@mui/icons-material/Archive';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useAuth } from '../../../../auth/contexts/AuthContext';

interface Category {
    category_id: number;
    name: string;
    prefix: string;
    product_count?: number;
    is_active: number;
}

const MedicineGroupPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Category; direction: 'asc' | 'desc' }>({
        key: 'name',
        direction: 'asc'
    });
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', prefix: '' });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [exportFileName, setExportFileName] = useState('product_categories');
    const [editCategory, setEditCategory] = useState({ category_id: 0, name: '', prefix: '' });
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [affectedProducts, setAffectedProducts] = useState<any[]>([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            // By default, only get active categories
            const response = await axios.get('/admin/inventory/categories', {
                params: {
                    includeInactive: 'false'
                }
            });
            console.log('Fetched categories:', response.data); // For debugging
            setCategories(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to fetch categories. Please try again.');
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

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: SelectChangeEvent) => {
        const newRowsPerPage = event.target.value === 'all' ? categories.length : parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    const handleSort = (key: keyof Category) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            await fetchCategories();
            setSelectedItems([]);
            setSearchQuery('');
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

    const handleAddCategory = async () => {
        try {
            await axios.post('/admin/inventory/add-category', newCategory);
            setSuccessMessage('Category added successfully');
            setIsAddDialogOpen(false);
            setNewCategory({ name: '', prefix: '' });
            await fetchCategories();
        } catch (error) {
            console.error('Error adding category:', error);
            setError('Failed to add category');
        }
    };

    const handleEditItem = (category: Category) => {
        setEditCategory({
            category_id: category.category_id,
            name: category.name,
            prefix: category.prefix
        });
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            await axios.post('/admin/inventory/update-category', {
                categoryId: editCategory.category_id,
                name: editCategory.name,
                prefix: editCategory.prefix
            });
            setSuccessMessage('Category updated successfully');
            setIsEditDialogOpen(false);
            await fetchCategories();
        } catch (error) {
            console.error('Error updating category:', error);
            setError('Failed to update category');
        }
    };

    const handleDeleteCategories = async () => {
        if (!user) {
            setError('User authentication required');
            return;
        }

        try {
            // Get affected products first
            const response = await axios.get(`/admin/inventory/category-products/${selectedItems[0]}`);

            if (response.data.affectedProducts) {
                setAffectedProducts(response.data.affectedProducts);
            }

            // Don't archive yet, just show the confirmation dialog
            setIsDeleteDialogOpen(true);
        } catch (error: any) {
            console.error('Error getting affected products:', error);
            setError(error.response?.data?.message || 'Failed to get affected products');
        }
    };

    const confirmArchive = async () => {
        try {
            await axios.post('/admin/inventory/archive-category/' + selectedItems[0], {
                archivedBy: user?.user_id
            });

            setSuccessMessage('Category archived successfully');
            setIsDeleteDialogOpen(false);
            setSelectedItems([]);
            setIsSelectionMode(false);
            await fetchCategories();
        } catch (error: any) {
            console.error('Error archiving category:', error);
            setError(error.response?.data?.message || 'Failed to archive category');
        }
    };

    const handleExport = () => {
        const exportData = processedCategories.map(category => ({
            'Category Name': category.name,
            'Prefix': category.prefix,
            'Number of Products': category.product_count || 0
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Categories');
        XLSX.writeFile(wb, `${exportFileName}.xlsx`);
        setIsExportDialogOpen(false);
    };

    const processedCategories = useMemo(() => {
        let filtered = [...categories];

        if (searchQuery) {
            filtered = filtered.filter(category =>
                category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                category.prefix.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        filtered.sort((a, b) => {
            const aValue = String(a[sortConfig.key] || '');
            const bValue = String(b[sortConfig.key] || '');
            return sortConfig.direction === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        });

        return filtered;
    }, [categories, searchQuery, sortConfig]);

    const paginatedCategories = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return processedCategories.slice(startIndex, startIndex + rowsPerPage);
    }, [processedCategories, page, rowsPerPage]);

    const handleViewCategory = (categoryName: string) => {
        navigate('/admin/inventory/view-medicines-available', {
            state: { preSelectedCategory: categoryName }
        });
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
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setIsAddDialogOpen(true)}
                            startIcon={<AddIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            Add Category
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
                            onClick={() => navigate('/admin/inventory/archived-categories')}
                            startIcon={<ArchiveIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            View Archive
                        </Button>
                        <Button
                            variant="contained"
                            color="inherit"
                            onClick={() => navigate('/admin/inventory/view-medicines-available')}
                            startIcon={<VisibilityIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            View Products
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                            color="error"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            startIcon={<DeleteIcon />}
                            sx={{ textTransform: 'none' }}
                            disabled={!isSelectionMode || selectedItems.length === 0}
                        >
                            Delete Selected ({selectedItems.length})
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
                            label="Search Category Name or Prefix"
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
                                        checked={selectedItems.length === paginatedCategories.length}
                                        indeterminate={selectedItems.length > 0 && selectedItems.length < paginatedCategories.length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedItems(paginatedCategories.map(category => category.category_id));
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
                                Category Name
                                {sortConfig.key === 'name' && (
                                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                )}
                            </TableCell>
                            <TableCell
                                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                onClick={() => handleSort('prefix')}
                            >
                                Prefix
                                {sortConfig.key === 'prefix' && (
                                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                )}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Number of Products</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedCategories.map((category) => (
                            <TableRow key={category.category_id}>
                                {isSelectionMode && (
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedItems.includes(category.category_id)}
                                            onChange={() => handleSelectItem(category.category_id)}
                                        />
                                    </TableCell>
                                )}
                                <TableCell>{category.name}</TableCell>
                                <TableCell>{category.prefix}</TableCell>
                                <TableCell>{category.product_count || 0}</TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleViewCategory(category.name)}
                                        sx={{ color: '#2BA3B6', mr: 0 }}
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
                                    {category.category_id !== 12 && (
                                        <>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditItem(category)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => {
                                                    setSelectedItems([category.category_id]);
                                                    setIsDeleteDialogOpen(true);
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 2 }}>
                <TablePagination
                    component="div"
                    count={processedCategories.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[]}
                />
            </Box>

            {/* Add Category Dialog */}
            <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Category Name"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label="Prefix"
                            value={newCategory.prefix}
                            onChange={(e) => setNewCategory(prev => ({ ...prev, prefix: e.target.value }))}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddCategory} variant="contained" color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Archive</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to archive {selectedItems.length === 1 ? 'this category' : 'these categories'}?
                    </Typography>
                    {affectedProducts.length > 0 && (
                        <>
                            <Typography sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                                The following products will be moved to "NO CATEGORY":
                            </Typography>
                            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                                {affectedProducts.map((product) => (
                                    <Typography key={product.id}>
                                        • {product.name} {product.brand_name ? `(${product.brand_name})` : ''}
                                    </Typography>
                                ))}
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmArchive} variant="contained" color="error">
                        Archive
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Export Dialog */}
            <Dialog open={isExportDialogOpen} onClose={() => setIsExportDialogOpen(false)}>
                <DialogTitle>Export Categories</DialogTitle>
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

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Category Name"
                            value={editCategory.name}
                            onChange={(e) => setEditCategory(prev => ({ ...prev, name: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label="Prefix"
                            value={editCategory.prefix}
                            onChange={(e) => setEditCategory(prev => ({ ...prev, prefix: e.target.value }))}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveEdit} variant="contained" color="primary">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MedicineGroupPage;