import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Alert,
    Modal,
    Paper,
    TableContainer,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TablePagination,
    CircularProgress,
    Stack,
    IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckIcon from '@mui/icons-material/Check';
import axios from 'axios';
import * as XLSX from 'xlsx';
import ExportDialog from '../../common/ExportDialog';

interface Transaction {
    id: number;
    invoice_number: string;
    created_at: string;
    total_amount: number;
    discount_amount: number;
    discount_type: string;
    payment_method: string;
    payment_status: string;
    customer_name: string;
    points_earned: number;
    branch_id: number;
    branch_name: string;
    item_count: number;
    items: string;
}

interface SortConfig {
    key: keyof Transaction;
    direction: 'asc' | 'desc';
}

const ViewAllTransaction = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const [openTransactionModal, setOpenTransactionModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: 'created_at',
        direction: 'desc'
    });
    const [openExportDialog, setOpenExportDialog] = useState(false);

    // Define columns for export
    const exportColumns = [
        { field: 'invoice_number', header: 'Invoice Number' },
        { field: 'created_at', header: 'Date & Time' },
        { field: 'total_amount', header: 'Total Amount' },
        { field: 'discount_amount', header: 'Discount' },
        { field: 'discount_type', header: 'Discount Type' },
        { field: 'payment_method', header: 'Payment Method' },
        { field: 'payment_status', header: 'Status' },
        { field: 'customer_name', header: 'Customer' },
        { field: 'points_earned', header: 'Points Earned' },
        { field: 'branch_name', header: 'Branch' },
        { field: 'items', header: 'Items' }
    ];

    // Format data for export
    const getExportData = () => {
        return transactions.map(t => ({
            ...t,
            created_at: new Date(t.created_at).toLocaleString(),
            total_amount: `₱${Number(t.total_amount).toFixed(2)}`,
            discount_amount: `₱${Number(t.discount_amount).toFixed(2)}`,
            points_earned: Number(t.points_earned).toFixed(2)
        }));
    };

    // Fetch transactions from backend
    const fetchAllTransactions = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/transactions/all');
            console.log('Fetched all transactions:', response.data);
            const parsedTransactions = response.data.map((t: any) => ({
                ...t,
                total_amount: parseFloat(t.total_amount) || 0,
                discount_amount: parseFloat(t.discount_amount) || 0,
                points_earned: parseFloat(t.points_earned) || 0,
                created_at: new Date(t.created_at).toISOString()
            }));
            setTransactions(parsedTransactions);
            setFilteredTransactions(parsedTransactions);
            setError(null);
        } catch (error) {
            console.error('Error fetching all transactions:', error);
            setError('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllTransactions();
    }, []);

    useEffect(() => {
        handleSearch();
    }, [transactions, searchQuery]);

    const handleSearch = () => {
        const query = searchQuery.toLowerCase();
        const filtered = transactions.filter(transaction =>
            transaction.invoice_number.toLowerCase().includes(query) ||
            transaction.customer_name.toLowerCase().includes(query) ||
            transaction.payment_status.toLowerCase().includes(query) ||
            transaction.branch_name.toLowerCase().includes(query)
        );
        setFilteredTransactions(filtered);
        setPage(0);
    };

    const handleSort = (key: keyof Transaction) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));

        const sorted = [...filteredTransactions].sort((a, b) => {
            const aValue = a[key];
            const bValue = b[key];
            
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        setFilteredTransactions(sorted);
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/api/transactions/${id}`);
            console.log('Transaction deleted:', id);
            setTransactions(prevTransactions => prevTransactions.filter(t => t.id !== id));
            setSuccessMessage('Transaction deleted successfully!');
            setOpenModal(false);
        } catch (error) {
            console.error('Error deleting transaction:', error);
            setError('Failed to delete transaction');
        }
    };

    const handleRefresh = async () => {
        await fetchAllTransactions();
        setSearchQuery('');
        setSuccessMessage('Data refreshed successfully');
    };

    const downloadReport = () => {
        const exportData = transactions.map(t => ({
            'Invoice Number': t.invoice_number,
            'Date & Time': new Date(t.created_at).toLocaleString(),
            'Total Amount': Number(t.total_amount).toFixed(2),
            'Discount': Number(t.discount_amount).toFixed(2),
            'Discount Type': t.discount_type,
            'Payment Method': t.payment_method,
            'Status': t.payment_status,
            'Customer': t.customer_name,
            'Branch': t.branch_name,
            'Points Earned': t.points_earned,
            'Items': t.items
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
        XLSX.writeFile(wb, 'Transaction_Report.xlsx');
    };

    // Pagination
    const paginatedTransactions = filteredTransactions.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Box sx={{ p: 2 }}>
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
                mb: 3
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
                            onClick={() => setOpenExportDialog(true)}
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
                    </Box>
            </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                        label="Search invoice, customer, status, or branch"
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

            {/* Transactions Table */}
            <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 390px)', overflow: 'none' }}>
                <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                            <TableCell 
                                onClick={() => handleSort('invoice_number')}
                                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Invoice #
                                {sortConfig.key === 'invoice_number' && (
                                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                )}
                            </TableCell>
                            <TableCell 
                                onClick={() => handleSort('created_at')}
                                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Date & Time
                                {sortConfig.key === 'created_at' && (
                                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                )}
                            </TableCell>
                            <TableCell 
                                onClick={() => handleSort('total_amount')}
                                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Total Amount
                                {sortConfig.key === 'total_amount' && (
                                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                )}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                            <TableCell 
                                onClick={() => handleSort('payment_status')}
                                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Status
                                {sortConfig.key === 'payment_status' && (
                                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                )}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Branch</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : paginatedTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No transactions found
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedTransactions.map((transaction) => (
                                <TableRow 
                                    key={transaction.id}
                                    sx={{
                                        height: '60px',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                >
                                    <TableCell>{transaction.invoice_number}</TableCell>
                                    <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                                    <TableCell>₱{Number(transaction.total_amount).toFixed(2)}</TableCell>
                                    <TableCell>{transaction.customer_name}</TableCell>
                                    <TableCell>{transaction.payment_status}</TableCell>
                                    <TableCell>{transaction.branch_name}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            <IconButton
                                                onClick={() => {
                                                    setSelectedTransaction(transaction);
                                                    setOpenTransactionModal(true);
                                                }}
                                                color="info"
                                                title="View Details"
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => {
                                                    setTransactionToDelete(transaction);
                                                    setOpenModal(true);
                                                }}
                                                color="error"
                                                title="Delete Transaction"
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
                count={filteredTransactions.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
            />

            {/* Delete Confirmation Modal */}
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                        boxShadow: 24,
                    p: 4,
                    width: 400,
                        borderRadius: 2,
                }}>
                    <Typography variant="h6" gutterBottom>
                        Confirm Delete
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        Are you sure you want to delete this transaction? This action cannot be undone.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" onClick={() => setOpenModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained" 
                            color="error"
                            onClick={() => transactionToDelete && handleDelete(transactionToDelete.id)}
                        >
                            Delete
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Transaction Details Modal */}
            <Modal open={openTransactionModal} onClose={() => setOpenTransactionModal(false)}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    width: 500,
                    borderRadius: 2,
                }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Transaction Details
                    </Typography>
                    {selectedTransaction && (
                        <Box sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Invoice Number</Typography>
                                    <Typography variant="body1">{selectedTransaction.invoice_number}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Date & Time</Typography>
                                    <Typography variant="body1">
                                        {new Date(selectedTransaction.created_at).toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                                    <Typography variant="body1">₱{Number(selectedTransaction.total_amount).toFixed(2)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Discount</Typography>
                                    <Typography variant="body1">
                                        ₱{Number(selectedTransaction.discount_amount).toFixed(2)}
                                        {selectedTransaction.discount_type !== 'None' && ` (${selectedTransaction.discount_type})`}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                        {selectedTransaction.payment_method}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Status</Typography>
                                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                        {selectedTransaction.payment_status}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Customer</Typography>
                                    <Typography variant="body1">{selectedTransaction.customer_name}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Branch</Typography>
                                    <Typography variant="body1">{selectedTransaction.branch_name}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Points Earned</Typography>
                                    <Typography variant="body1">{selectedTransaction.points_earned}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Items ({selectedTransaction.item_count})</Typography>
                                    <Typography variant="body1">{selectedTransaction.items}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" onClick={() => setOpenTransactionModal(false)}>
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Export Dialog */}
            <ExportDialog
                open={openExportDialog}
                onClose={() => setOpenExportDialog(false)}
                data={getExportData()}
                columns={exportColumns}
                filename="Transaction_Report"
            />

                {successMessage && (
                    <Alert
                        icon={<CheckIcon fontSize="inherit" />}
                        severity="success"
                        sx={{
                            position: 'fixed',
                            bottom: 20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                        zIndex: 1201,
                        }}
                    >
                        {successMessage}
                    </Alert>
                )}
            </Box>
    );
};

export default ViewAllTransaction;
