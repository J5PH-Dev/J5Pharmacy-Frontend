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
    Breadcrumbs,
    Link,
    Chip,
    CircularProgress,
    Checkbox
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestoreIcon from '@mui/icons-material/Restore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import BusinessIcon from '@mui/icons-material/Business';
import CheckBox from '@mui/icons-material/CheckBox';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ExportDialog from '../../common/ExportDialog';

interface ArchivedBranch {
    archive_id: number;
    branch_id: number;
    branch_code: string;
    branch_name: string;
    address: string;
    city: string;
    date_opened: string;
    manager_name: string | null;
    manager_email: string | null;
    manager_phone: string | null;
    archived_by_name: string;
    archive_reason: string;
    archived_at: string;
    is_active: boolean;
}

interface SortConfig {
    key: keyof ArchivedBranch;
    direction: 'asc' | 'desc';
}

const ArchivedBranchesPage = () => {
    const navigate = useNavigate();
    const [archives, setArchives] = useState<ArchivedBranch[]>([]);
    const [filteredArchives, setFilteredArchives] = useState<ArchivedBranch[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: 'archived_at',
        direction: 'desc'
    });

    // Modal states
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [selectedArchive, setSelectedArchive] = useState<ArchivedBranch | null>(null);

    // Add these state variables
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedBranches, setSelectedBranches] = useState<number[]>([]);

    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

    const exportColumns = [
        { field: 'branch_code', header: 'Branch Code' },
        { field: 'branch_name', header: 'Branch Name' },
        { field: 'address', header: 'Address' },
        { field: 'city', header: 'City' },
        { field: 'date_opened', header: 'Date Opened' },
        { field: 'manager_name', header: 'Branch Manager' },
        { field: 'manager_email', header: 'Manager Email' },
        { field: 'manager_phone', header: 'Manager Contact' },
        { field: 'is_active', header: 'Status' },
        { field: 'archived_by_name', header: 'Archived By' },
        { field: 'archive_reason', header: 'Archive Reason' },
        { field: 'archived_at', header: 'Archived At' }
    ];

    useEffect(() => {
        fetchArchivedBranches();
    }, []);

    useEffect(() => {
        handleSearch();
    }, [archives, searchQuery]);

    const fetchArchivedBranches = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/admin/archived-branches');
            setArchives(response.data);
            setFilteredArchives(response.data);
            setError(null);
        } catch (error: any) {
            console.error('Error fetching archived branches:', error);
            setError(error.response?.data?.message || 'Failed to fetch archived branches');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        const query = searchQuery.toLowerCase();
        const filtered = archives.filter(archive =>
            archive.branch_name.toLowerCase().includes(query) ||
            archive.branch_code.toLowerCase().includes(query) ||
            archive.address.toLowerCase().includes(query) ||
            archive.city.toLowerCase().includes(query) ||
            (archive.manager_name?.toLowerCase().includes(query) || '') ||
            archive.archived_by_name.toLowerCase().includes(query)
        );
        setFilteredArchives(filtered);
        setPage(0);
    };

    const handleSort = (key: keyof ArchivedBranch) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));

        const sorted = [...filteredArchives].sort((a, b) => {
            const aValue = a[key] ?? '';
            const bValue = b[key] ?? '';

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        setFilteredArchives(sorted);
    };

    const handleBulkRestore = async () => {
        if (selectedBranches.length === 0) return;
        
        // Find all selected archives
        const selectedArchives = archives.filter(archive => selectedBranches.includes(archive.branch_id));
        if (selectedArchives.length === 0) return;

        // Get the names for display
        const selectedNames = selectedArchives.map(archive => archive.branch_name).join(", ");
        const archiveIds = selectedArchives.map(archive => archive.archive_id);

        setSelectedArchive({
            ...selectedArchives[0],
            branch_name: selectedNames
        });
        setIsRestoreModalOpen(true);
    };

    const handleRestoreBranch = async () => {
        if (!selectedArchive) return;

        try {
            if (selectedBranches.length > 1) {
                // Bulk restore
                const archiveIds = archives
                    .filter(archive => selectedBranches.includes(archive.branch_id))
                    .map(archive => archive.archive_id);

                await axios.post('/api/admin/bulk-restore-branches', {
                    archive_ids: archiveIds
                });
                setSuccessMessage('Branches restored successfully');
            } else {
                // Single restore
                await axios.post(`/api/admin/restore-branch/${selectedArchive.archive_id}`);
                setSuccessMessage('Branch restored successfully');
            }
            setIsRestoreModalOpen(false);
            setSelectedArchive(null);
            setSelectedBranches([]);
            await fetchArchivedBranches();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to restore branch(es)');
        }
    };

    const handleRefresh = async () => {
        await fetchArchivedBranches();
        setSearchQuery('');
        setSuccessMessage('Data refreshed successfully');
    };

    // Pagination
    const paginatedArchives = filteredArchives.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const toggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
        if (selectionMode) {
            setSelectedBranches([]);
        }
    };

    const handleSelectBranch = (branchId: number) => {
        setSelectedBranches(prev => {
            if (prev.includes(branchId)) {
                return prev.filter(id => id !== branchId);
            } else {
                return [...prev, branchId];
            }
        });
    };

    const handleExportClick = () => {
        setIsExportDialogOpen(true);
    };

    const handleExportClose = () => {
        setIsExportDialogOpen(false);
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedBranches(paginatedArchives.map(archive => archive.branch_id));
        } else {
            setSelectedBranches([]);
        }
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
                            onClick={() => navigate('/admin/branches')}
                            startIcon={<ArrowBack />}
                            sx={{ textTransform: 'none' }}
                        >
                            Back to Branches
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
                            color="primary"
                            startIcon={<RestoreIcon />}
                            onClick={handleBulkRestore}
                            disabled={selectedBranches.length === 0}
                            sx={{ textTransform: 'none' }}
                        >
                            Restore Selected ({selectedBranches.length})
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
                                setRowsPerPage(parseInt(e.target.value));
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

            {/* Archives Table */}
            <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {selectionMode && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedBranches.length > 0 && selectedBranches.length < paginatedArchives.length}
                                        checked={selectedBranches.length === paginatedArchives.length && paginatedArchives.length > 0}
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
                                onClick={() => handleSort('archived_at')}
                                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Archived Date
                                {sortConfig.key === 'archived_at' && (
                                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                )}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Archived By</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
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
                        ) : paginatedArchives.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    No archived branches found
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedArchives.map((archive) => (
                                <TableRow 
                                    key={archive.branch_id} 
                                    onClick={() => selectionMode && handleSelectBranch(archive.branch_id)}
                                    sx={{ 
                                        backgroundColor: selectedBranches.includes(archive.branch_id) ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                                        cursor: selectionMode ? 'pointer' : 'default',
                                        '&:hover': {
                                            backgroundColor: selectionMode ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                >
                                    {selectionMode && (
                                        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedBranches.includes(archive.branch_id)}
                                                onChange={(e) => handleSelectBranch(archive.branch_id)}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell>{archive.branch_name}</TableCell>
                                    <TableCell>{archive.branch_code}</TableCell>
                                    <TableCell>{`${archive.address}, ${archive.city}`}</TableCell>
                                    <TableCell>{archive.manager_name || 'Not Assigned'}</TableCell>
                                    <TableCell>
                                        {new Date(archive.archived_at).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </TableCell>
                                    <TableCell>{archive.archived_by_name}</TableCell>
                                    <TableCell>{archive.archive_reason}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={archive.is_active ? 'Active' : 'Inactive'}
                                            color={archive.is_active ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => {
                                                setSelectedArchive(archive);
                                                setIsRestoreModalOpen(true);
                                            }}
                                            color="primary"
                                            title="Restore Branch"
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
                count={filteredArchives.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
            />

            {/* Restore Branch Modal */}
            <Dialog
                open={isRestoreModalOpen}
                onClose={() => setIsRestoreModalOpen(false)}
            >
                <DialogTitle>Restore Branch</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to restore the branch "{selectedArchive?.branch_name}"?
                        This will move the branch back to the active branches list.
                        {!selectedArchive?.is_active && ' Note: The branch will remain inactive after restoration.'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsRestoreModalOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleRestoreBranch}
                        variant="contained"
                        color="primary"
                    >
                        Restore
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Export Dialog */}
            <ExportDialog
                open={isExportDialogOpen}
                onClose={handleExportClose}
                data={filteredArchives}
                columns={exportColumns}
                filename="archived_branches"
            />
        </Box>
    );
};

export default ArchivedBranchesPage; 