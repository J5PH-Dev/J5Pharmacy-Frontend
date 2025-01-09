import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Alert,
    InputAdornment,
    TablePagination,
    Chip,
    CircularProgress,
    Stack,
    Checkbox
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestoreIcon from '@mui/icons-material/Restore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ExportDialog from '../../common/ExportDialog';
import CheckBox from '@mui/icons-material/CheckBox';
import { useAuth } from '../../../../auth/contexts/AuthContext';

interface ArchivedCustomer {
    customer_id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
    discount_type: string;
    discount_id_number: string | null;
    archived_at: string;
    archive_reason: string;
    archived_by: number;
    created_at: string;
    updated_at: string;
}

interface SortConfig {
    key: keyof ArchivedCustomer;
    direction: 'asc' | 'desc';
}

const ArchivedCustomersPage = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<ArchivedCustomer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<ArchivedCustomer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: 'name',
        direction: 'asc'
    });
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const { user } = useAuth();
    const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
    const [selectionMode, setSelectionMode] = useState(false);

    const exportColumns = [
        { field: 'name', header: 'Name' },
        { field: 'phone', header: 'Phone' },
        { field: 'email', header: 'Email' },
        { field: 'address', header: 'Address' },
        { field: 'discount_type', header: 'Discount Type' },
        { field: 'discount_id_number', header: 'Discount ID' },
        { field: 'archived_at', header: 'Archived At' },
        { field: 'archive_reason', header: 'Archive Reason' },
        { field: 'created_at', header: 'Created At' },
        { field: 'updated_at', header: 'Updated At' }
    ];

    useEffect(() => {
        fetchArchivedCustomers();
    }, []);

    useEffect(() => {
        handleSearch();
    }, [customers, searchQuery]);

    const fetchArchivedCustomers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/customers/archived');
            setCustomers(response.data.data.customers);
            setFilteredCustomers(response.data.data.customers);
            setError(null);
        } catch (error: any) {
            console.error('Error fetching archived customers:', error);
            setError(error.response?.data?.message || 'Failed to fetch archived customers');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        const query = searchQuery.toLowerCase();
        const filtered = customers.filter(customer =>
            customer.name.toLowerCase().includes(query) ||
            customer.phone.toLowerCase().includes(query) ||
            customer.email.toLowerCase().includes(query) ||
            customer.address.toLowerCase().includes(query)
        );
        setFilteredCustomers(filtered);
        setPage(0);
    };

    const handleSort = (key: keyof ArchivedCustomer) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));

        const sorted = [...filteredCustomers].sort((a, b) => {
            const aValue = a[key] ?? '';
            const bValue = b[key] ?? '';
            
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        setFilteredCustomers(sorted);
    };

    const handleRestore = async (customerId: number) => {
        try {
            await axios.post(`/api/customers/${customerId}/restore`);
            setSuccessMessage('Customer restored successfully');
            await fetchArchivedCustomers();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to restore customer');
        }
    };

    const handleRefresh = async () => {
        await fetchArchivedCustomers();
        setSearchQuery('');
        setSuccessMessage('Data refreshed successfully');
    };

    const handleExportClick = () => {
        setIsExportDialogOpen(true);
    };

    const handleExportClose = () => {
        setIsExportDialogOpen(false);
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedCustomers(paginatedCustomers.map(customer => customer.customer_id));
        } else {
            setSelectedCustomers([]);
        }
    };

    const handleSelectCustomer = (customerId: number) => {
        setSelectedCustomers(prev => 
            prev.includes(customerId)
                ? prev.filter(id => id !== customerId)
                : [...prev, customerId]
        );
    };

    const handleBulkRestore = async () => {
        if (selectedCustomers.length === 0) return;

        try {
            await Promise.all(selectedCustomers.map(customerId => 
                axios.post(`/api/customers/${customerId}/restore`)
            ));
            setSuccessMessage('Selected customers restored successfully');
            setSelectedCustomers([]);
            await fetchArchivedCustomers();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to restore selected customers');
        }
    };

    const toggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
        setSelectedCustomers([]);
    };

    // Pagination
    const paginatedCustomers = filteredCustomers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Box sx={{ p: 0, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>
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
                            color="inherit"
                            onClick={() => navigate('/admin/customer-info')}
                            sx={{ textTransform: 'none' }}
                        >
                            Back to Customers
                        </Button>
                        <Button
                            variant="contained"
                            color="inherit"
                            onClick={handleExportClick}
                            startIcon={<RefreshIcon />}
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
                            color="success"
                            startIcon={<RestoreIcon />}
                            onClick={handleBulkRestore}
                            disabled={selectedCustomers.length === 0}
                            sx={{ textTransform: 'none' }}
                        >
                            Restore Selected ({selectedCustomers.length})
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Search customer name, phone, email, or address"
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

            {/* Customers Table */}
            <Box sx={{ backgroundColor: 'white', p: 2, borderRadius: 1, boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)' }}>
                <TableContainer sx={{ maxHeight: 'calc(100vh - 450px)' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {selectionMode && (
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            indeterminate={selectedCustomers.length > 0 && selectedCustomers.length < paginatedCustomers.length}
                                            checked={selectedCustomers.length === paginatedCustomers.length && paginatedCustomers.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </TableCell>
                                )}
                                <TableCell 
                                    onClick={() => handleSort('name')}
                                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Name
                                    {sortConfig.key === 'name' && (
                                        sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                    )}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Contact Info</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Discount</TableCell>
                                <TableCell 
                                    onClick={() => handleSort('archived_at')}
                                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Archived At
                                    {sortConfig.key === 'archived_at' && (
                                        sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                    )}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Archive Reason</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={selectionMode ? 7 : 6} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : paginatedCustomers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={selectionMode ? 7 : 6} align="center">
                                        No archived customers found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedCustomers.map((customer) => (
                                    <TableRow 
                                        key={customer.customer_id}
                                        onClick={() => selectionMode && handleSelectCustomer(customer.customer_id)}
                                        sx={{
                                            height: '60px',
                                            backgroundColor: selectedCustomers.includes(customer.customer_id) ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                                            cursor: selectionMode ? 'pointer' : 'default',
                                            '&:hover': {
                                                backgroundColor: selectionMode ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                                            }
                                        }}
                                    >
                                        {selectionMode && (
                                            <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedCustomers.includes(customer.customer_id)}
                                                    onChange={() => handleSelectCustomer(customer.customer_id)}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell>{customer.name}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{customer.phone}</Typography>
                                            <Typography variant="body2" color="textSecondary">{customer.email}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={customer.discount_type}
                                                color={customer.discount_type !== 'None' ? 'primary' : 'default'}
                                                size="small"
                                            />
                                            {customer.discount_id_number && (
                                                <Typography variant="body2" color="textSecondary">
                                                    ID: {customer.discount_id_number}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>{new Date(customer.archived_at).toLocaleDateString()}</TableCell>
                                        <TableCell>{customer.archive_reason}</TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1}>
                                                <IconButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/admin/customer-info/${customer.customer_id}`);
                                                    }}
                                                    color="info"
                                                    title="View Details"
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleRestore(customer.customer_id)}
                                                    color="success"
                                                    title="Restore Customer"
                                                >
                                                    <RestoreIcon />
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
                    <TablePagination
                        component="div"
                        count={filteredCustomers.length}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </Box>
            </Box>

            {/* Export Dialog */}
            <ExportDialog
                open={isExportDialogOpen}
                onClose={handleExportClose}
                data={filteredCustomers}
                columns={exportColumns}
                filename="archived_customers"
            />
        </Box>
    );
};

export default ArchivedCustomersPage; 