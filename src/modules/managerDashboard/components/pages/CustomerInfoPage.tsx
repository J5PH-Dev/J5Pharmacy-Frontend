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
  Dialog,
  DialogTitle,
  DialogContent,
    DialogContentText,
    DialogActions,
    Alert,
  InputAdornment,
    TablePagination,
    Grid,
    Card,
    CardContent,
    Chip,
  CircularProgress,
    Switch,
    FormControlLabel,
    Checkbox,
    Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CheckBox from '@mui/icons-material/CheckBox';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ExportDialog from '../common/ExportDialog';
import { useAuth } from '../../../auth/contexts/AuthContext';

interface Customer {
  customer_id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
    discount_type: string;
  discount_id_number: string | null;
  card_id: string | null;
  star_points_id: number | null;
  created_at: string;
  updated_at: string;
}

interface CustomerStatistics {
    total_customers: number;
    senior_count: number;
    pwd_count: number;
    employee_count: number;
}

interface SortConfig {
    key: keyof Customer;
    direction: 'asc' | 'desc';
}

interface ValidationErrors {
    name: boolean;
    phone: boolean;
    email: boolean;
    address: boolean;
    discount_type: boolean;
    discount_id_number: boolean;
}

interface FormData {
    name: string;
    phone: string;
    email: string;
    address: string;
    discount_type: string;
    discount_id_number: string;
}

const CustomerInfoPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [statistics, setStatistics] = useState<CustomerStatistics | null>(null);
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

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [archiveReason, setArchiveReason] = useState('');
    const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
    const [selectionMode, setSelectionMode] = useState(false);

    // Form states
    const [formData, setFormData] = useState<FormData>({
        name: '',
        phone: '',
        email: '',
        address: '',
        discount_type: 'None',
        discount_id_number: ''
    });

    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
        name: false,
        phone: false,
        email: false,
        address: false,
        discount_type: false,
        discount_id_number: false
    });

    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

    // Add Customer Dialog
    const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
    const [applyStarPoints, setApplyStarPoints] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        discount_type: 'None',
        discount_id_number: '',
        card_id: '',
        apply_star_points: false
    });

    // Update the state for card scanning
    const [isCardScanMode, setIsCardScanMode] = useState(false);

    const exportColumns = [
        { field: 'name', header: 'Name' },
        { field: 'phone', header: 'Phone' },
        { field: 'email', header: 'Email' },
        { field: 'address', header: 'Address' },
        { field: 'discount_type', header: 'Discount Type' },
        { field: 'discount_id_number', header: 'Discount ID' },
        { field: 'created_at', header: 'Created At' },
        { field: 'updated_at', header: 'Updated At' }
    ];

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        handleSearch();
    }, [customers, searchQuery]);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/customers');
            setCustomers(response.data.data.customers);
            setFilteredCustomers(response.data.data.customers);
            setStatistics(response.data.data.statistics);
            setError(null);
        } catch (error: any) {
            console.error('Error fetching customers:', error);
            setError(error.response?.data?.message || 'Failed to fetch customers');
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

    const handleStartScan = () => {
        setIsCardScanMode(true);
        // Focus the card ID field after enabling it
        setTimeout(() => {
            const cardInput = document.getElementById('card-id-field');
            if (cardInput) {
                cardInput.focus();
            }
        }, 100);
    };

    // Add function to handle card input
    const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewCustomer(prev => ({
            ...prev,
            card_id: value
        }));
    };

    // Add function to handle card input key press
    const handleCardKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setIsCardScanMode(false);
            setSuccessMessage('Card scanned successfully');
        }
    };

    const handleAddCustomer = async () => {
        try {
            if (!newCustomer.name.trim()) {
                setError('Customer name is required');
                return;
            }

            if (applyStarPoints && !newCustomer.card_id) {
                setError('Please scan an RFID card for Star Points registration');
                return;
            }

            const response = await axios.post('/api/customers', {
                ...newCustomer,
                apply_star_points: applyStarPoints
            });

            if (response.data.success) {
                setIsAddCustomerDialogOpen(false);
                setNewCustomer({
                    name: '',
                    phone: '',
                    email: '',
                    address: '',
                    discount_type: 'None',
                    discount_id_number: '',
                    card_id: '',
                    apply_star_points: false
                });
                setApplyStarPoints(false);
                fetchCustomers();
                setSuccessMessage('Customer added successfully' + 
                    (applyStarPoints ? ' with Star Points registration' : ''));
            }
        } catch (error: any) {
            console.error('Error adding customer:', error);
            setError(error.response?.data?.message || 'Failed to add customer');
        }
    };

    const handleArchiveCustomer = async () => {
        if (!selectedCustomer && selectedCustomers.length === 0) return;
        if (!archiveReason) return;

        try {
            if (selectedCustomers.length > 1) {
                // Bulk archive
                await axios.post('/api/customers/bulk-archive', {
                    customer_ids: selectedCustomers,
                    archived_by: user?.user_id,
                    archive_reason: archiveReason
                });
                setSuccessMessage('Customers archived successfully');
            } else {
                // Single archive
                await axios.post(`/api/customers/${selectedCustomer?.customer_id}/archive`, {
                    archived_by: user?.user_id,
                    archive_reason: archiveReason
                });
                setSuccessMessage('Customer archived successfully');
            }
            setIsArchiveModalOpen(false);
            setSelectedCustomer(null);
            setArchiveReason('');
            setSelectedCustomers([]);
            await fetchCustomers();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to archive customer(s)');
        }
    };

    const handleSort = (key: keyof Customer) => {
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

    const handleRefresh = async () => {
        await fetchCustomers();
        setSearchQuery('');
        setSuccessMessage('Data refreshed successfully');
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            email: '',
            address: '',
            discount_type: 'None',
            discount_id_number: ''
        });
        setValidationErrors({
            name: false,
            phone: false,
            email: false,
            address: false,
            discount_type: false,
            discount_id_number: false
        });
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

    const handleBulkArchive = () => {
        if (selectedCustomers.length === 0) return;
        setIsArchiveModalOpen(true);
    };

    const handleExportClick = () => {
        setIsExportDialogOpen(true);
    };

    const handleExportClose = () => {
        setIsExportDialogOpen(false);
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

    // Add Customer Dialog Content
    const addCustomerDialog = (
        <Dialog 
            open={isAddCustomerDialogOpen} 
            onClose={() => setIsAddCustomerDialogOpen(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            label="Name"
                            fullWidth
                            required
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12}>
        <TextField
                            label="Phone"
          fullWidth
                            value={newCustomer.phone}
                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        />
                  </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Email"
                            fullWidth
                            type="email"
                            value={newCustomer.email}
                            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                        />
                  </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Address"
                            fullWidth
                            multiline
                            rows={2}
                            value={newCustomer.address}
                            onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                        />
                  </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Discount Type</InputLabel>
                            <Select
                                value={newCustomer.discount_type}
                                label="Discount Type"
                                onChange={(e) => setNewCustomer({ 
                                    ...newCustomer, 
                                    discount_type: e.target.value,
                                    discount_id_number: e.target.value === 'None' ? '' : newCustomer.discount_id_number
                                })}
                            >
                                <MenuItem value="None">None</MenuItem>
                                <MenuItem value="Senior">Senior Citizen</MenuItem>
                                <MenuItem value="PWD">PWD</MenuItem>
                                <MenuItem value="Employee">Employee</MenuItem>
                            </Select>
                        </FormControl>
                  </Grid>
                    {newCustomer.discount_type !== 'None' && (
                        <Grid item xs={12}>
                            <TextField
                                label="Discount ID Number"
                                fullWidth
                                required
                                value={newCustomer.discount_id_number}
                                onChange={(e) => setNewCustomer({ ...newCustomer, discount_id_number: e.target.value })}
                                helperText="Required for discount eligibility"
                    />
                  </Grid>
                    )}

                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={applyStarPoints}
                                    onChange={(e) => setApplyStarPoints(e.target.checked)}
                                />
                            }
                            label="Apply for Star Points"
                        />
                    </Grid>

                    {applyStarPoints && (
                        <>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <TextField
                                        id="card-id-field"
                                        label="Card ID"
                                        fullWidth
                                        required
                                        value={newCustomer.card_id}
                                        onChange={handleCardInput}
                                        onKeyPress={handleCardKeyPress}
                                        disabled={!isCardScanMode}
                                        helperText="Scan RFID card to register"
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleStartScan}
                                        disabled={isCardScanMode}
                                        sx={{ minWidth: '120px', height: '56px' }}
                                    >
                                        {isCardScanMode ? 'Scanning...' : 'Scan Card'}
                                    </Button>
                                </Box>
                            </Grid>
                        </>
                  )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    setIsAddCustomerDialogOpen(false);
                    setApplyStarPoints(false);
                    setNewCustomer({
                        name: '',
                        phone: '',
                        email: '',
                        address: '',
                        discount_type: 'None',
                        discount_id_number: '',
                        card_id: '',
                        apply_star_points: false
                    });
                }}>
                    Cancel
                </Button>
                <Button 
                    onClick={handleAddCustomer} 
                    variant="contained" 
                    color="primary"
                    disabled={isScanning}
                >
                    Add Customer
                </Button>
            </DialogActions>
        </Dialog>
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

            {/* Statistics Cards */}
            {statistics && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                                <Typography variant="subtitle2" color="text.secondary">Total Customers</Typography>
                                <Typography variant="h4">{statistics.total_customers}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                                <Typography variant="subtitle2" color="text.secondary">Senior Citizens</Typography>
                                <Typography variant="h4">{statistics.senior_count}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                                <Typography variant="subtitle2" color="text.secondary">PWD Customers</Typography>
                                <Typography variant="h4">{statistics.pwd_count}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                                <Typography variant="subtitle2" color="text.secondary">Employee Customers</Typography>
                                <Typography variant="h4">{statistics.employee_count}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
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
                            color="primary"
                            onClick={() => setIsAddCustomerDialogOpen(true)}
                            startIcon={<AddIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            Add Customer
                        </Button>
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
                            onClick={handleRefresh}
                            startIcon={<RefreshIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="contained"
                            color="inherit"
                            onClick={() => navigate('/manager/archived-customers')}
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
                            color="warning"
                            startIcon={<ArchiveIcon />}
                            onClick={handleBulkArchive}
                            disabled={selectedCustomers.length === 0}
                            sx={{ textTransform: 'none' }}
                        >
                            Archive Selected ({selectedCustomers.length})
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
                                <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Discount</TableCell>
                                <TableCell 
                                    onClick={() => handleSort('created_at')}
                                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Created At
                                    {sortConfig.key === 'created_at' && (
                                        sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                    )}
                                </TableCell>
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
                                        No customers found
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
                                        <TableCell>{customer.address}</TableCell>
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
                                            {customer.star_points_id && (
                                                <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
                                                    Star Points ID: {customer.star_points_id}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1}>
                                                <IconButton
                                                    onClick={() => navigate(`/manager/customer-info/${customer.customer_id}`)}
                                                    color="info"
                                                    title="View Details"
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => navigate(`/manager/customer-info/${customer.customer_id}/edit-details`)}
                                                    color="primary"
                                                    title="Edit Customer"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => {
                                                        setSelectedCustomer(customer);
                                                        setIsArchiveModalOpen(true);
                                                    }}
                                                    color="error"
                                                    title="Archive Customer"
                                                >
                                                    <DeleteIcon />
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

            {/* Add Customer Dialog */}
            {addCustomerDialog}

            {/* Archive Customer Modal */}
          <Dialog
                open={isArchiveModalOpen}
                onClose={() => setIsArchiveModalOpen(false)}
            >
                <DialogTitle>Archive Customer{selectedCustomers.length > 1 ? 's' : ''}</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        {selectedCustomers.length > 1 
                            ? `Are you sure you want to archive ${selectedCustomers.length} selected customers?`
                            : `Are you sure you want to archive the customer "${selectedCustomer?.name}"?`
                        }
                        This will move the customer{selectedCustomers.length > 1 ? 's' : ''} to the archive.
                    </DialogContentText>
                    <TextField
                        label="Archive Reason"
                        value={archiveReason}
                        onChange={(e) => setArchiveReason(e.target.value)}
                        fullWidth
                        required
                        multiline
                        rows={3}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setIsArchiveModalOpen(false);
                        setArchiveReason('');
                    }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleArchiveCustomer}
                        variant="contained"
                        color="warning"
                        disabled={!archiveReason}
                    >
                        Archive {selectedCustomers.length > 1 ? `(${selectedCustomers.length})` : ''}
                    </Button>
                </DialogActions>
          </Dialog>

            {/* Export Dialog */}
            <ExportDialog
                open={isExportDialogOpen}
                onClose={handleExportClose}
                data={filteredCustomers}
                columns={exportColumns}
                filename="customers"
            />
    </Box>
  );
};

export default CustomerInfoPage;
