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
    Breadcrumbs,
    Link,
    Stack,
    Chip,
    CircularProgress,
    Switch,
    FormControlLabel,
    Checkbox
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
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useAuth } from '../../../auth/contexts/AuthContext';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CheckBox from '@mui/icons-material/CheckBox';
import ExportDialog from '../common/ExportDialog';

interface Branch {
    branch_id: number;
    branch_code: string;
    branch_name: string;
    address: string;
    city: string;
    date_opened: string;
    branch_manager: number;
    manager_name?: string;
    email?: string;
    contact_number?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
}

interface Manager {
    user_id: number;
    name: string;
    email: string;
    phone: string;
}

interface SortConfig {
    key: keyof Branch;
    direction: 'asc' | 'desc';
}

interface ValidationErrors {
    branch_code: boolean;
    branch_name: boolean;
    address: boolean;
    city: boolean;
    date_opened: boolean;
    branch_manager: boolean;
}

interface FormData {
    branch_code: string;
    branch_name: string;
    address: string;
    city: string;
    date_opened: string;
    branch_manager: string;
    is_active: boolean;
}

const BranchesPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: 'branch_name',
        direction: 'asc'
    });

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [archiveReason, setArchiveReason] = useState('');
    const [isStatusChangeModalOpen, setIsStatusChangeModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState(false);
    const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
    const [selectionMode, setSelectionMode] = useState(false);

    // Form states
    const [formData, setFormData] = useState<FormData>({
        branch_code: '',
        branch_name: '',
        address: '',
        city: '',
        date_opened: '',
        branch_manager: '',
        is_active: true
    });

    const [tempFormData, setTempFormData] = useState<FormData>({
        branch_code: '',
        branch_name: '',
        address: '',
        city: '',
        date_opened: '',
        branch_manager: '',
        is_active: true
    });

    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
        branch_code: false,
        branch_name: false,
      address: false,
      city: false,
        date_opened: false,
        branch_manager: false
    });

    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

    const exportColumns = [
      { field: 'branch_code', header: 'Branch Code' },
      { field: 'branch_name', header: 'Branch Name' },
      { field: 'address', header: 'Address' },
      { field: 'city', header: 'City' },
      { field: 'date_opened', header: 'Date Opened' },
      { field: 'manager_name', header: 'Branch Manager' },
      { field: 'email', header: 'Manager Email' },
      { field: 'contact_number', header: 'Manager Contact' },
      { field: 'is_active', header: 'Status' },
      { field: 'created_at', header: 'Created At' },
      { field: 'updated_at', header: 'Updated At' }
    ];

    useEffect(() => {
        fetchBranches();
        fetchManagers();
    }, []);

    useEffect(() => {
        handleSearch();
    }, [branches, searchQuery]);

    const fetchBranches = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/admin/branches');
            setBranches(response.data);
            setFilteredBranches(response.data);
            setError(null);
        } catch (error: any) {
            console.error('Error fetching branches:', error);
            setError(error.response?.data?.message || 'Failed to fetch branches');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchManagers = async () => {
        try {
            const response = await axios.get('/api/admin/branch-managers');
            setManagers(response.data);
        } catch (error: any) {
            console.error('Error fetching managers:', error);
            setError(error.response?.data?.message || 'Failed to fetch managers');
        }
    };

    const handleSearch = () => {
        const query = searchQuery.toLowerCase();
        const filtered = branches.filter(branch =>
            branch.branch_name.toLowerCase().includes(query) ||
            branch.branch_code.toLowerCase().includes(query) ||
            branch.address.toLowerCase().includes(query) ||
            branch.city.toLowerCase().includes(query) ||
            (branch.manager_name?.toLowerCase().includes(query) || '')
        );
        setFilteredBranches(filtered);
        setPage(0);
    };

    const handleAddBranch = async () => {
        const errors: ValidationErrors = {
            branch_code: !tempFormData.branch_code,
            branch_name: !tempFormData.branch_name,
            address: !tempFormData.address,
            city: !tempFormData.city,
            date_opened: !tempFormData.date_opened,
            branch_manager: !tempFormData.branch_manager
        };

        if (Object.values(errors).some(error => error)) {
      setValidationErrors(errors);
      return;
    }
  
        try {
            await axios.post('/api/admin/add-branch', tempFormData);
            setSuccessMessage('Branch added successfully');
            setIsAddModalOpen(false);
            resetForm();
            await fetchBranches();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to add branch');
        }
    };

    const handleUpdateBranch = async () => {
        if (!selectedBranch) return;

        const errors: ValidationErrors = {
            branch_code: !formData.branch_code,
            branch_name: !formData.branch_name,
            address: !formData.address,
            city: !formData.city,
            date_opened: !formData.date_opened,
            branch_manager: !formData.branch_manager
        };

        if (Object.values(errors).some(error => error)) {
            setValidationErrors(errors);
            return;
        }

        try {
            await axios.post('/api/admin/update-branch', {
                branch_id: selectedBranch.branch_id,
                ...formData
            });
            setSuccessMessage('Branch updated successfully');
            setIsEditModalOpen(false);
            resetForm();
            await fetchBranches();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to update branch');
        }
    };

    const handleArchiveBranch = async () => {
        if (!selectedBranch || !archiveReason) return;

        try {
            if (selectedBranches.length > 1) {
                // Bulk archive
                await axios.post('/api/admin/bulk-archive-branches', {
                    branch_ids: selectedBranches,
                    archived_by: user?.user_id,
                    archive_reason: archiveReason
                });
                setSuccessMessage('Branches archived successfully');
            } else {
                // Single archive
                await axios.post(`/api/admin/archive-branch/${selectedBranch.branch_id}`, {
                    archived_by: user?.user_id,
                    archive_reason: archiveReason
                });
                setSuccessMessage('Branch archived successfully');
            }
            setIsArchiveModalOpen(false);
            setSelectedBranch(null);
            setArchiveReason('');
            setSelectedBranches([]);
            await fetchBranches();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to archive branch(es)');
        }
    };

    const handleSort = (key: keyof Branch) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));

        const sorted = [...filteredBranches].sort((a, b) => {
            const aValue = a[key] ?? '';
            const bValue = b[key] ?? '';
            
            if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
                return sortConfig.direction === 'asc'
                    ? (aValue === bValue ? 0 : aValue ? -1 : 1)
                    : (aValue === bValue ? 0 : aValue ? 1 : -1);
            }
            
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        setFilteredBranches(sorted);
    };

    const handleEditClick = (branch: Branch) => {
        setSelectedBranch(branch);
        setFormData({
            branch_code: branch.branch_code,
            branch_name: branch.branch_name,
            address: branch.address,
            city: branch.city,
            date_opened: branch.date_opened,
            branch_manager: branch.branch_manager.toString(),
            is_active: branch.is_active
        });
        setIsEditModalOpen(true);
    };

    const handleViewClick = (branch: Branch) => {
        setSelectedBranch(branch);
        setIsViewModalOpen(true);
    };

    const handleRefresh = async () => {
        await fetchBranches();
        setSearchQuery('');
        setSuccessMessage('Data refreshed successfully');
    };

    const resetForm = () => {
        setFormData({
            branch_code: '',
            branch_name: '',
            address: '',
            city: '',
            date_opened: '',
            branch_manager: '',
            is_active: true
        });
        setValidationErrors({
            branch_code: false,
            branch_name: false,
            address: false,
            city: false,
            date_opened: false,
            branch_manager: false
        });
    };

    // Pagination
    const paginatedBranches = filteredBranches.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleStatusChange = async () => {
        if (!selectedBranch) return;

        try {
            await axios.post('/api/admin/update-branch', {
                branch_id: selectedBranch.branch_id,
                ...formData,
                is_active: newStatus
            });
            setSuccessMessage(`Branch status ${newStatus ? 'activated' : 'deactivated'} successfully`);
            setIsStatusChangeModalOpen(false);
            setSelectedBranch(null);
            await fetchBranches();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to update branch status');
        }
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedBranches(paginatedBranches.map(branch => branch.branch_id));
        } else {
            setSelectedBranches([]);
        }
    };

    const handleSelectBranch = (branchId: number) => {
        setSelectedBranches(prev => 
            prev.includes(branchId)
                ? prev.filter(id => id !== branchId)
                : [...prev, branchId]
        );
    };

    const handleBulkArchive = async () => {
        if (selectedBranches.length === 0) return;

        // Find selected branches for display
        const selectedBranchNames = branches
            .filter(branch => selectedBranches.includes(branch.branch_id))
            .map(branch => branch.branch_name)
            .join(", ");

        setSelectedBranch({
            ...branches.find(branch => branch.branch_id === selectedBranches[0])!,
            branch_name: selectedBranchNames
        });
        setIsArchiveModalOpen(true);
    };

    const generateBranchCode = async () => {
        try {
            const response = await axios.get('/api/admin/generate-branch-code');
            setTempFormData(prev => ({ ...prev, branch_code: response.data.branch_code }));
        } catch (error: any) {
            console.error('Error generating branch code:', error);
            setError(error.response?.data?.message || 'Failed to generate branch code');
        }
    };

    const handleAddModalOpen = () => {
        generateBranchCode();
        setTempFormData({
            branch_code: '',
            branch_name: '',
            address: '',
            city: '',
            date_opened: '',
            branch_manager: '',
            is_active: true
        });
        setIsAddModalOpen(true);
    };

    const handleExportClick = () => {
        setIsExportDialogOpen(true);
    };

    const handleExportClose = () => {
        setIsExportDialogOpen(false);
    };

    const toggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
    };

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
  sx={{
                                backgroundColor: '#01A768', 
                                color: '#fff', 
    fontWeight: 'medium',
    textTransform: 'none',
                                '&:hover': { backgroundColor: '#017F4A' }
  }}
                            onClick={handleAddModalOpen}
                            startIcon={<AddIcon />}
>
                            Add Branch
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
                            onClick={() => navigate('/admin/archived-branches')}
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
                            disabled={selectedBranches.length === 0}
                            sx={{ textTransform: 'none' }}
                        >
                            Archive Selected ({selectedBranches.length})
</Button>
    </Box>
  </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Search branch name, code, address, city, or manager"
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

            {/* Branches Table */}
            <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
                <Table stickyHeader>
                <TableHead>
                  <TableRow>
                        {selectionMode && (
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={selectedBranches.length > 0 && selectedBranches.length < paginatedBranches.length}
                                    checked={selectedBranches.length === paginatedBranches.length && paginatedBranches.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                        )}
                        <TableCell 
                            onClick={() => handleSort('branch_name')}
                            sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Branch Name
                            {sortConfig.key === 'branch_name' && (
                                sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                            )}
                        </TableCell>
                        <TableCell 
                            onClick={() => handleSort('branch_code')}
                            sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Branch Code
                            {sortConfig.key === 'branch_code' && (
                                sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                            )}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Manager</TableCell>
                        <TableCell 
                            onClick={() => handleSort('date_opened')}
                            sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Date Opened
                            {sortConfig.key === 'date_opened' && (
                                sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                            )}
                        </TableCell>
                        <TableCell 
                            onClick={() => handleSort('is_active')}
                            sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Status
                            {sortConfig.key === 'is_active' && (
                                sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                            )}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : paginatedBranches.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No branches found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedBranches.map((branch) => (
                                    <TableRow 
                                        key={branch.branch_id} 
                                        onClick={() => selectionMode && handleSelectBranch(branch.branch_id)}
      sx={{
                                            height: '60px',
                                            backgroundColor: !branch.is_active ? 'rgba(0, 0, 0, 0.04)' : 
                                                            selectedBranches.includes(branch.branch_id) ? 'rgba(25, 118, 210, 0.08)' : 
                                                            'inherit',
                                            cursor: selectionMode ? 'pointer' : 'default',
                                            '&:hover': {
                                                backgroundColor: selectionMode ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                                            }
                                        }}
                                    >
                                        {selectionMode && (
                                            <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedBranches.includes(branch.branch_id)}
                                                    onChange={(e) => handleSelectBranch(branch.branch_id)}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell>{branch.branch_name}</TableCell>
                                        <TableCell>{branch.branch_code}</TableCell>
                                        <TableCell>{`${branch.address}, ${branch.city}`}</TableCell>
                                        <TableCell>{branch.manager_name || 'Not Assigned'}</TableCell>
                                        <TableCell>{new Date(branch.date_opened).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={branch.is_active ? 'Active' : 'Inactive'}
                                                color={branch.is_active ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1}>
                                                <IconButton
                                                    onClick={() => handleViewClick(branch)}
                                                    color="info"
                                                    title="View Details"
    >
      <VisibilityIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleEditClick(branch)}
      color="primary"
                                                    title="Edit Branch"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => {
                                                        setSelectedBranch(branch);
                                                        setIsArchiveModalOpen(true);
                                                    }}
        color="error"
                                                    title="Archive Branch"
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

            <TablePagination
                component="div"
                count={filteredBranches.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
            />

            {/* Add Branch Modal */}
            <Dialog
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Add New Branch</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
        <TextField
                                label="Branch Code"
                                value={tempFormData.branch_code}
                                disabled
          fullWidth
                                required
                                error={validationErrors.branch_code}
        />
      </Grid>
                        <Grid item xs={12} sm={6}>
        <TextField
                                label="Branch Name"
                                value={tempFormData.branch_name}
                                onChange={(e) => setTempFormData({ ...tempFormData, branch_name: e.target.value })}
          fullWidth
                                required
                                error={validationErrors.branch_name}
        />
      </Grid>
                        <Grid item xs={12}>
        <TextField
                                label="Address"
                                value={tempFormData.address}
                                onChange={(e) => setTempFormData({ ...tempFormData, address: e.target.value })}
          fullWidth
                                required
                                error={validationErrors.address}
        />
      </Grid>
                        <Grid item xs={12} sm={6}>
        <TextField
                                label="City"
                                value={tempFormData.city}
                                onChange={(e) => setTempFormData({ ...tempFormData, city: e.target.value })}
          fullWidth
                                required
                                error={validationErrors.city}
        />
      </Grid>
                        <Grid item xs={12} sm={6}>
        <TextField
                                label="Date Opened"
                                type="date"
                                value={tempFormData.date_opened}
                                onChange={(e) => setTempFormData({ ...tempFormData, date_opened: e.target.value })}
          fullWidth
                                required
                                error={validationErrors.date_opened}
                                InputLabelProps={{ shrink: true }}
        />
      </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required error={validationErrors.branch_manager}>
                                <InputLabel>Branch Manager</InputLabel>
                                <Select
                                    value={tempFormData.branch_manager}
                                    label="Branch Manager"
                                    onChange={(e) => setTempFormData({ ...tempFormData, branch_manager: e.target.value })}
                                >
                                    {managers.map((manager) => (
                                        <MenuItem key={manager.user_id} value={manager.user_id}>
                                            {manager.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={tempFormData.is_active}
                                        onChange={(e) => setTempFormData({ 
                                            ...tempFormData, 
                                            is_active: e.target.checked 
                                        })}
                                    />
                                }
                                label="Active"
        />
      </Grid>
    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
      <Button
        onClick={() => {
                            setFormData(tempFormData);
                            handleAddBranch();
                        }} 
        variant="contained"
        color="primary"
      >
                        Add Branch
      </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Branch Modal */}
            <Dialog
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Edit Branch</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
      <TextField
                                label="Branch Code"
                                value={tempFormData.branch_code}
                                onChange={(e) => setTempFormData({ ...tempFormData, branch_code: e.target.value })}
  fullWidth
                                required
                                error={validationErrors.branch_code}
                            />
      </Grid>
                        <Grid item xs={12} sm={6}>
      <TextField
                                label="Branch Name"
                                value={tempFormData.branch_name}
                                onChange={(e) => setTempFormData({ ...tempFormData, branch_name: e.target.value })}
  fullWidth
                                required
                                error={validationErrors.branch_name}
/>
      </Grid>
                        <Grid item xs={12}>
      <TextField
                                label="Address"
                                value={tempFormData.address}
                                onChange={(e) => setTempFormData({ ...tempFormData, address: e.target.value })}
  fullWidth
                                required
                                error={validationErrors.address}
/>
      </Grid>
                        <Grid item xs={12} sm={6}>
      <TextField
                                label="City"
                                value={tempFormData.city}
                                onChange={(e) => setTempFormData({ ...tempFormData, city: e.target.value })}
  fullWidth
                                required
                                error={validationErrors.city}
/>
      </Grid>
                        <Grid item xs={12} sm={6}>
      <TextField
                                label="Date Opened"
                                type="date"
                                value={tempFormData.date_opened}
                                onChange={(e) => setTempFormData({ ...tempFormData, date_opened: e.target.value })}
  fullWidth
                                required
                                error={validationErrors.date_opened}
                                InputLabelProps={{ shrink: true }}
/>
      </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required error={validationErrors.branch_manager}>
                                <InputLabel>Branch Manager</InputLabel>
                                <Select
                                    value={tempFormData.branch_manager}
                                    label="Branch Manager"
                                    onChange={(e) => setTempFormData({ ...tempFormData, branch_manager: e.target.value })}
                                >
                                    {managers.map((manager) => (
                                        <MenuItem key={manager.user_id} value={manager.user_id}>
                                            {manager.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={tempFormData.is_active}
                                        onChange={(e) => setTempFormData({ 
                                            ...tempFormData, 
                                            is_active: e.target.checked 
                                        })}
                                    />
                                }
                                label="Active"
/>
      </Grid>
    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={() => {
                            if (tempFormData.is_active !== formData.is_active) {
                                setNewStatus(tempFormData.is_active);
                                setIsStatusChangeModalOpen(true);
                            } else {
                                setFormData(tempFormData);
                                handleUpdateBranch();
                            }
                        }} 
                        variant="contained" 
                        color="primary"
                    >
                        Update Branch
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Branch Modal */}
            <Dialog
                open={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Branch Details</DialogTitle>
                <DialogContent>
                    {selectedBranch && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">Branch Code</Typography>
                                <Typography variant="body1">{selectedBranch.branch_code}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">Branch Name</Typography>
                                <Typography variant="body1">{selectedBranch.branch_name}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                                <Typography variant="body1">{selectedBranch.address}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">City</Typography>
                                <Typography variant="body1">{selectedBranch.city}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">Date Opened</Typography>
                                <Typography variant="body1">{new Date(selectedBranch.date_opened).toLocaleDateString()}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">Branch Manager</Typography>
                                <Typography variant="body1">{selectedBranch.manager_name || 'Not Assigned'}</Typography>
                            </Grid>
                            {selectedBranch.manager_name && (
                                <>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Manager Email</Typography>
                                        <Typography variant="body1">{selectedBranch.email || 'N/A'}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Manager Contact</Typography>
                                        <Typography variant="body1">{selectedBranch.contact_number || 'N/A'}</Typography>
                                    </Grid>
                                </>
                            )}
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                                <Chip 
                                    label={selectedBranch.is_active ? 'Active' : 'Inactive'}
                                    color={selectedBranch.is_active ? 'success' : 'error'}
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Archive Branch Modal */}
            <Dialog
                open={isArchiveModalOpen}
                onClose={() => setIsArchiveModalOpen(false)}
            >
                <DialogTitle>Archive Branch</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Are you sure you want to archive the branch "{selectedBranch?.branch_name}"?
                        This will deactivate the branch and move it to the archive.
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
                    <Button onClick={() => setIsArchiveModalOpen(false)}>Cancel</Button>
    <Button
                        onClick={handleArchiveBranch}
                        variant="contained"
                        color="warning"
                        disabled={!archiveReason}
                    >
                        Archive
</Button>
                </DialogActions>
            </Dialog>

            {/* Status Change Confirmation Modal */}
            <Dialog
                open={isStatusChangeModalOpen}
                onClose={() => setIsStatusChangeModalOpen(false)}
            >
                <DialogTitle>Confirm Status Change</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to {newStatus ? 'activate' : 'deactivate'} this branch?
                        {!newStatus && ' This will affect all operations related to this branch.'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setIsStatusChangeModalOpen(false);
                        setTempFormData(formData); // Reset to original status
                    }}>
                        Cancel
                    </Button>
      <Button
                        onClick={() => {
                            setFormData(tempFormData);
                            handleStatusChange();
                        }}
        variant="contained"
                        color={newStatus ? 'success' : 'error'}
      >
                        {newStatus ? 'Activate' : 'Deactivate'}
      </Button>
                </DialogActions>
            </Dialog>

            {/* Export Dialog */}
            <ExportDialog
                open={isExportDialogOpen}
                onClose={handleExportClose}
                data={filteredBranches}
                columns={exportColumns}
                filename="branches"
            />
    </Box>
  );
};

export default BranchesPage;