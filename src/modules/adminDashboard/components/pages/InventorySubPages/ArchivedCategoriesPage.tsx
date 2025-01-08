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
import RestoreIcon from '@mui/icons-material/Restore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import * as XLSX from 'xlsx';

interface ArchivedCategory {
    category_id: number;
    name: string;
    prefix: string;
    archived_by: number;
    archived_by_name: string;
    archived_at: string;
}

const ArchivedCategoriesPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [categories, setCategories] = useState<ArchivedCategory[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: keyof ArchivedCategory; direction: 'asc' | 'desc' }>({
        key: 'archived_at',
        direction: 'desc'
    });
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [exportFileName, setExportFileName] = useState('archived_categories');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/admin/inventory/archived-categories');
            setCategories(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching archived categories:', error);
            setError('Failed to fetch archived categories. Please try again.');
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

    const handleSort = (key: keyof ArchivedCategory) => {
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

    const handleRestore = async (categoryId: number) => {
        try {
            await axios.post(`/admin/inventory/restore-category/${categoryId}`);
            setSuccessMessage('Category restored successfully');
            await fetchCategories();
        } catch (error) {
            console.error('Error restoring category:', error);
            setError('Failed to restore category');
        }
    };

    const handleRestoreSelected = async () => {
        try {
            await Promise.all(selectedItems.map(categoryId => 
                axios.post(`/admin/inventory/restore-category/${categoryId}`)
            ));
            setSuccessMessage('Selected categories restored successfully');
            setSelectedItems([]);
            await fetchCategories();
        } catch (error) {
            console.error('Error restoring categories:', error);
            setError('Failed to restore selected categories');
        }
    };

    const handleExport = () => {
        const exportData = processedCategories.map(category => ({
            'Category Name': category.name,
            'Prefix': category.prefix,
            'Archived By': category.archived_by_name,
            'Archived At': new Date(category.archived_at).toLocaleString()
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Archived Categories');
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

    return (
        <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: '16px' }}>
                <Link color="inherit" onClick={handleBreadcrumbClick('/admin/inventory')}>
                    Inventory
                </Link>
                <Link color="inherit" onClick={handleBreadcrumbClick('/admin/inventory/view-medicines-group')}>
                    Product Categories
                </Link>
                <Typography color="text.primary">Archived Categories</Typography>
            </Breadcrumbs>

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
                        <Button
                            variant="contained"
                            color="inherit"
                            onClick={() => navigate('/admin/inventory/view-medicines-group')}
                            startIcon={<ArrowBackIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            Back to Categories
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
                            onClick={handleRestoreSelected}
                            startIcon={<RestoreIcon />}
                            sx={{ textTransform: 'none' }}
                            disabled={!isSelectionMode || selectedItems.length === 0}
                        >
                            Restore Selected
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
                            <TableCell
                                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                onClick={() => handleSort('archived_by_name')}
                            >
                                Archived By
                                {sortConfig.key === 'archived_by_name' && (
                                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                )}
                            </TableCell>
                            <TableCell
                                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                onClick={() => handleSort('archived_at')}
                            >
                                Archived At
                                {sortConfig.key === 'archived_at' && (
                                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                )}
                            </TableCell>
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
                                <TableCell>{category.archived_by_name}</TableCell>
                                <TableCell>{new Date(category.archived_at).toLocaleString()}</TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleRestore(category.category_id)}
                                        title="Restore"
                                        color="warning"
                                    >
                                        <RestoreIcon />
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
                    count={processedCategories.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[]}
                />
            </Box>

            {/* Export Dialog */}
            <Dialog open={isExportDialogOpen} onClose={() => setIsExportDialogOpen(false)}>
                <DialogTitle>Export Archived Categories</DialogTitle>
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

export default ArchivedCategoriesPage; 