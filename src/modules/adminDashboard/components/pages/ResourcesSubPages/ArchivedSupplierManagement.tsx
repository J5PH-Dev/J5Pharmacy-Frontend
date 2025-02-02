import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
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
    DialogActions,
    Alert,
    TablePagination,
    Chip,
    CircularProgress,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ExportDialog from '../../common/ExportDialog';

interface ArchivedSupplier {
    archive_id: number;
    supplier_id: number;
    supplier_name: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    is_active: boolean;
    archived_by_name: string;
    archived_at: string;
    archive_reason: string;
}

const ArchivedSupplierManagement: React.FC = () => {
    const [archives, setArchives] = useState<ArchivedSupplier[]>([]);
    const [filteredArchives, setFilteredArchives] = useState<ArchivedSupplier[]>([]);
    const [selectedArchive, setSelectedArchive] = useState<ArchivedSupplier | null>(null);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        fetchArchivedSuppliers();
    }, []);

    const fetchArchivedSuppliers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/resources/archived-suppliers');
            console.log('Fetched archived suppliers:', response.data);
            setArchives(response.data);
            setFilteredArchives(response.data);
            setError(null);
        } catch (error: any) {
            console.error('Error fetching archived suppliers:', error);
            setError(error.response?.data?.message || 'Failed to fetch archived suppliers');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        const query = searchQuery.toLowerCase();
        const filtered = archives.filter(archive =>
            archive.supplier_name.toLowerCase().includes(query) ||
            archive.contact_person.toLowerCase().includes(query) ||
            archive.email.toLowerCase().includes(query) ||
            archive.phone.toLowerCase().includes(query) ||
            archive.address.toLowerCase().includes(query) ||
            archive.archived_by_name.toLowerCase().includes(query)
        );
        setFilteredArchives(filtered);
        setPage(0);
    };

    useEffect(() => {
        handleSearch();
    }, [searchQuery, archives]);

    const handleRestoreSupplier = async () => {
        if (!selectedArchive) return;

        try {
            await axios.post(`/api/resources/restore-supplier/${selectedArchive.archive_id}`);
            setSuccess('Supplier restored successfully');
            setIsRestoreModalOpen(false);
            await fetchArchivedSuppliers();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to restore supplier');
        }
    };

    const handleRefresh = async () => {
        await fetchArchivedSuppliers();
        setSearchQuery('');
        setSuccess('Data refreshed successfully');
    };

    const exportColumns = [
        { field: 'supplier_name', header: 'Supplier Name' },
        { field: 'contact_person', header: 'Contact Person' },
        { field: 'email', header: 'Email' },
        { field: 'phone', header: 'Phone' },
        { field: 'address', header: 'Address' },
        { field: 'archived_by_name', header: 'Archived By' },
        { field: 'archived_at', header: 'Archived Date' },
        { field: 'archive_reason', header: 'Archive Reason' },
        { field: 'is_active', header: 'Status' }
    ];

    return (
        <Box sx={{ p: 3, ml: { xs: 1, md: 35 }, mt: 4 }}>
            {/* Header Section */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/admin/resources/supplier-management')}
                >
                    Back to Suppliers
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        color="inherit"
                        onClick={fetchArchivedSuppliers}
                        startIcon={<RefreshIcon />}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        color="inherit"
                        onClick={() => setIsExportDialogOpen(true)}
                        startIcon={<FileDownloadIcon />}
                    >
                        Export
                    </Button>
                </Box>
            </Box>

            {/* Alerts */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            {/* Search Box */}
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Search archived suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />

            {/* Main Content */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Supplier Name</TableCell>
                            <TableCell>Contact Person</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Archived Date</TableCell>
                            <TableCell>Archived By</TableCell>
                            <TableCell>Reason</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : archives.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center">
                                    No archived suppliers found
                                </TableCell>
                            </TableRow>
                        ) : (
                            archives.map((archive) => (
                                <TableRow key={archive.archive_id}>
                                    <TableCell>{archive.supplier_name}</TableCell>
                                    <TableCell>{archive.contact_person}</TableCell>
                                    <TableCell>{archive.email}</TableCell>
                                    <TableCell>{archive.phone}</TableCell>
                                    <TableCell>{archive.address}</TableCell>
                                    <TableCell>
                                        {new Date(archive.archived_at).toLocaleString()}
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
                                            title="Restore Supplier"
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
                count={archives.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
            />

            {/* Restore Modal */}
            <Dialog
                open={isRestoreModalOpen}
                onClose={() => setIsRestoreModalOpen(false)}
            >
                <DialogTitle>Restore Supplier</DialogTitle>
                <DialogContent>
                    Are you sure you want to restore {selectedArchive?.supplier_name}?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsRestoreModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleRestoreSupplier} variant="contained" color="primary">
                        Restore
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Export Dialog */}
            <ExportDialog
                open={isExportDialogOpen}
                onClose={() => setIsExportDialogOpen(false)}
                data={archives}
                columns={exportColumns}
                filename="archived_suppliers"
            />
        </Box>
    );
};

export default ArchivedSupplierManagement; 