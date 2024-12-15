import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Divider, Button, Grid, TextField, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, Alert, Modal, Breadcrumbs, Link } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import * as XLSX from 'xlsx';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';

// Sample latest transactions
const latestTransactions = [
    { orderId: '12345', dateTime: '2024-12-11 12:30:45', totalAmount: '$100.00', customerName: 'John Doe', paymentMethod: 'Credit Card', status: 'Completed', itemsPurchased: 3, discountApplied: '$10.00' },
    { orderId: '12346', dateTime: '2024-12-10 15:22:30', totalAmount: '$150.00', customerName: 'Jane Smith', paymentMethod: 'PayPal', status: 'Pending', itemsPurchased: 5, discountApplied: '$15.00' },
    { orderId: '12347', dateTime: '2024-12-09 14:10:15', totalAmount: '$200.00', customerName: 'Robert Brown', paymentMethod: 'Debit Card', status: 'Cancelled', itemsPurchased: 2, discountApplied: '$0.00' },
    { orderId: '12348', dateTime: '2024-12-08 09:15:50', totalAmount: '$250.00', customerName: 'Emily White', paymentMethod: 'Credit Card', status: 'Completed', itemsPurchased: 7, discountApplied: '$20.00' },
    { orderId: '12349', dateTime: '2024-12-07 11:30:40', totalAmount: '$175.00', customerName: 'Michael Green', paymentMethod: 'Credit Card', status: 'Completed', itemsPurchased: 4, discountApplied: '$5.00' },
    { orderId: '12350', dateTime: '2024-12-06 16:45:30', totalAmount: '$125.00', customerName: 'Sarah Blue', paymentMethod: 'PayPal', status: 'Pending', itemsPurchased: 1, discountApplied: '$0.00' },
    { orderId: '12351', dateTime: '2024-12-05 13:20:10', totalAmount: '$99.99', customerName: 'David King', paymentMethod: 'Debit Card', status: 'Completed', itemsPurchased: 3, discountApplied: '$10.00' },
    { orderId: '12352', dateTime: '2024-12-04 10:05:00', totalAmount: '$80.00', customerName: 'Linda Pink', paymentMethod: 'Credit Card', status: 'Cancelled', itemsPurchased: 2, discountApplied: '$0.00' },
    { orderId: '12353', dateTime: '2024-12-03 08:00:00', totalAmount: '$220.00', customerName: 'William Purple', paymentMethod: 'PayPal', status: 'Completed', itemsPurchased: 5, discountApplied: '$25.00' },
    { orderId: '12354', dateTime: '2024-12-02 17:30:30', totalAmount: '$135.00', customerName: 'Patricia Yellow', paymentMethod: 'Debit Card', status: 'Pending', itemsPurchased: 4, discountApplied: '$10.00' }
];

const downloadReport = () => {
    const ws = XLSX.utils.json_to_sheet(latestTransactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Latest Transactions');
    XLSX.writeFile(wb, 'Latest_Transactions_Report.xlsx');
};

const ViewAllTransaction = () => {
    const [transactions, setTransactions] = useState(latestTransactions); // State for the transactions list
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // State for success message
    const [openModal, setOpenModal] = useState(false); // State for modal visibility
    const [transactionToDelete, setTransactionToDelete] = useState<any>(null); // Transaction to delete
    const [openTransactionModal, setOpenTransactionModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const navigate = useNavigate();

    // Handle deleting the transaction
    const handleDelete = (orderId: string) => {
        setTransactions((prevTransactions) => {
            const updatedTransactions = prevTransactions.filter(transaction => transaction.orderId !== orderId);
            return updatedTransactions;
        });
        setSuccessMessage('Transaction deleted successfully!');
        setOpenModal(false); // Ensure modal is closed immediately after deletion
    };

    // Handle opening the delete confirmation modal
    const openDeleteModal = (transaction: any) => {
        setTransactionToDelete(transaction);
        setOpenModal(true);
    };

    // Handle closing the modal
    const handleCloseModal = () => {
        setOpenModal(false);
    };

    // Function to open the transaction details modal
    const openTransactionDetailsModal = (transaction: any) => {
        setSelectedTransaction(transaction);
        setOpenTransactionModal(true);
    };

    // Function to close the transaction details modal
    const handleCloseTransactionModal = () => {
        setOpenTransactionModal(false);
        setSelectedTransaction(null);
    };

    // Remove success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
            return () => clearTimeout(timer); // Cleanup timeout on component unmount or when successMessage changes
        }
    }, [successMessage]);

    const handleBreadcrumbClick = (path: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(path);
    };
    // Handle selecting/deselecting rows
    const handleSelectRow = (orderId: string) => {
        const newSelectedRows = new Set(selectedRows);
        if (newSelectedRows.has(orderId)) {
            newSelectedRows.delete(orderId);
        } else {
            newSelectedRows.add(orderId);
        }
        setSelectedRows(newSelectedRows);
    };

    // Handle deleting selected rows
    const handleDeleteItemMultiple = () => {
        setTransactions((prevTransactions) => prevTransactions.filter(transaction => !selectedRows.has(transaction.orderId)));
        setSelectedRows(new Set()); // Clear selected rows after deletion
        setSuccessMessage('Selected transactions deleted successfully!');
    };

    return (
        <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1 }}>
            <Breadcrumbs
                aria-label="breadcrumb"
                sx={{
                    mb: 2,
                    display: 'flex',
                    justifyContent: { xs: 'center', sm: 'flex-start' },
                }}
            >
                <Link color="inherit" onClick={handleBreadcrumbClick('/admin/sales-report')}>Sales Report</Link>
                <Typography color="text.primary">Transactions</Typography>
            </Breadcrumbs>

            {/* Title and Button Container with Centered Content */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                        History Transactions
                    </Typography>
                    <Typography variant="body1" sx={{ mt: -1 }}>
                        View detailed information on past transactions and their statuses.
                    </Typography>
                </Box>
                <Grid item xs={12}>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button variant="contained"
                            sx={{
                                color: 'black',
                                backgroundColor: 'white',
                                boxShadow: 'none',
                                border: '1px solid rgba(29, 36, 46, 0.2)',
                                padding: '10px 20px',
                                '&:hover': {
                                    transform: 'scale(1.012)',
                                    backgroundColor: 'white',
                                    boxShadow: 'none',
                                },
                            }} onClick={downloadReport}>
                            Download Report
                        </Button>
                    </Box>
                </Grid>
            </Box>

            <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2, alignItems: 'center' }}>
                    <div style={{ flexGrow: 1 }}>
                        <TextField
                            label="Search"
                            variant="outlined"
                            size="small"
                            sx={{
                                width: '700px',
                                backgroundColor: 'white', // Set background to white
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Date Range"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                width: '200px',
                                backgroundColor: 'white', // Set background to white
                                mr: 2,
                            }}
                        />
                        <TextField
                            label="Medicine Group"
                            select
                            sx={{
                                width: '200px',
                                backgroundColor: 'white', // Set background to white
                            }}
                        >
                            <MenuItem value="Group1">Group 1</MenuItem>
                            <MenuItem value="Group2">Group 2</MenuItem>
                            <MenuItem value="Group3">Group 3</MenuItem>
                        </TextField>
                        <TextField
                            label="Branch"
                            select
                            sx={{
                                width: '200px',
                                backgroundColor: 'white', // Set background to white
                                ml: 2,
                            }}
                        >
                            <MenuItem value="Branch1">Branch 1</MenuItem>
                            <MenuItem value="Branch2">Branch 2</MenuItem>
                            <MenuItem value="Branch3">Branch 3</MenuItem>
                        </TextField>
                    </div>
                </Box>
            </Grid>




            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Box sx={{ backgroundColor: 'white', padding: '10px 10px', borderLeft: '1px solid rgba(29, 36, 46, 0.2)', borderRight: '1px solid rgba(29, 36, 46, 0.2)' }}>
                        <Box sx={{ maxHeight: '500px', overflowY: 'auto', mb: 1 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedRows(new Set(transactions.map(transaction => transaction.orderId)));
                                                    } else {
                                                        setSelectedRows(new Set());
                                                    }
                                                }}
                                                style={{
                                                    transform: 'scale(1.2)', // Make checkbox bigger
                                                    marginLeft: '10px', // Adjust position if needed
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>Order ID</TableCell>
                                        <TableCell>Date & Time</TableCell>
                                        <TableCell>Total Amount</TableCell>
                                        <TableCell>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.map((transaction) => (
                                        <TableRow key={transaction.orderId}>
                                            <TableCell padding="checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.has(transaction.orderId)}
                                                    onChange={() => handleSelectRow(transaction.orderId)}
                                                    style={{
                                                        transform: 'scale(1.2)', // Make checkbox bigger
                                                        marginLeft: '10px', // Adjust position if needed
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>{transaction.orderId}</TableCell>
                                            <TableCell>{transaction.dateTime}</TableCell>
                                            <TableCell>{transaction.totalAmount}</TableCell>
                                            <TableCell>
                                                <Button variant="outlined" size="small" sx={{ marginRight: '8px' }} onClick={() => openTransactionDetailsModal(transaction)}>
                                                    View
                                                </Button>
                                                <Button variant="outlined" color="error" size="small" onClick={() => openDeleteModal(transaction)}>
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Box>
                </Grid>
            </Grid>


            {/* Show delete button if rows are selected */}
            {selectedRows.size > 0 && (
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: 'white',
                        color: '#F0483E',
                        padding: '15px 24px',
                        border: '1px solid #F0483E',
                        marginTop: '20px',
                        marginBottom: '60px',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: '#FFF5F5' },
                    }}
                    onClick={handleDeleteItemMultiple}
                    startIcon={<DeleteIcon sx={{ color: '#F0483E' }} />}
                >
                    Delete Medicine
                </Button>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        padding: '30px 40px',
                        boxShadow: 24,
                        width: '350px',
                        borderRadius: 2,
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h6">Are you sure you want to delete this transaction?</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleCloseModal}
                            sx={{ flex: 1, marginRight: '8px' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(transactionToDelete?.orderId)}
                            sx={{ flex: 1 }}
                        >
                            Delete
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Transaction Details Modal */}
            <Modal open={openTransactionModal} onClose={handleCloseTransactionModal}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white', padding: '30px 40px', boxShadow: 24, width: '500px', borderRadius: 2, textAlign: 'center',
                }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Transaction Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {selectedTransaction && (
                        <Box sx={{ textAlign: 'left' }}>
                            <Typography variant="body1"><strong>Order ID:</strong> {selectedTransaction.orderId}</Typography>
                            <Typography variant="body1"><strong>Date & Time:</strong> {selectedTransaction.dateTime}</Typography>
                            <Typography variant="body1"><strong>Total Amount:</strong> {selectedTransaction.totalAmount}</Typography>
                            <Typography variant="body1"><strong>Customer Name:</strong> {selectedTransaction.customerName}</Typography>
                            <Typography variant="body1"><strong>Payment Method:</strong> {selectedTransaction.paymentMethod}</Typography>
                            <Typography variant="body1"><strong>Transaction Status:</strong> {selectedTransaction.status}</Typography>
                            <Typography variant="body1"><strong>Items Purchased:</strong> {selectedTransaction.itemsPurchased}</Typography>
                            <Typography variant="body1"><strong>Discount Applied:</strong> {selectedTransaction.discountApplied}</Typography>
                        </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 3 }}>
                        <Button variant="outlined" onClick={handleCloseTransactionModal} sx={{ padding: '8px 16px' }}>
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        padding: '30px 40px',  // Increased padding for more whitespace
                        boxShadow: 24,
                        width: '350px',  // Slightly wider modal
                        borderRadius: 2,  // Rounded corners
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                        Are you sure you want to delete this transaction?
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
                        <Button variant="outlined" onClick={handleCloseModal} sx={{ padding: '8px 16px' }}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleDelete(transactionToDelete?.orderId)}
                            sx={{ padding: '8px 16px' }}
                        >
                            Confirm Delete
                        </Button>
                    </Box>
                </Box>
            </Modal>


            <Box>
                {successMessage && (
                    <Alert
                        icon={<CheckIcon fontSize="inherit" />}
                        severity="success"
                        sx={{
                            position: 'fixed',
                            bottom: 20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 1201, // Ensure it's above other content
                        }}
                    >
                        {successMessage}
                    </Alert>
                )}
            </Box>
        </Box >
    );
};

export default ViewAllTransaction;
