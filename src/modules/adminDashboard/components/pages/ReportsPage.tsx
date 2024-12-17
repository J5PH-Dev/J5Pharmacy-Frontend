import React, { useEffect, useState } from 'react';
import {Box, Typography, Button, Grid, TextField, MenuItem, Table, TableBody, TableCell,TableHead, TableRow, Alert, Modal, Divider,} from '@mui/material';
import * as XLSX from 'xlsx';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Define transaction type
interface Transaction {
  orderId: string;
  dateTime: string;
  totalAmount: number;
}

// Fix for downloadReport function
const downloadReport = (transactions: Transaction[]) => {
  if (!transactions || transactions.length === 0) {
    console.error("No transactions to download");
    return;  // Early return to prevent download if no transactions
  }
  
  const ws = XLSX.utils.json_to_sheet(transactions);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
  XLSX.writeFile(wb, 'Transactions_Report.xlsx');
};

const ReportsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [openTransactionModal, setOpenTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const navigate = useNavigate();

  // Fetch sales data
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await axios.get('/api/sales');
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };

    fetchSalesData();
  }, []);

  const handleDelete = (orderId: string) => {
    if (!orderId) {
      console.error('No valid Order ID to delete');
      return;
    }
  
    // Perform deletion
    setTransactions((prevTransactions) =>
      prevTransactions.filter((transaction) => transaction.orderId !== orderId)
    );
  
    setSuccessMessage('Transaction deleted successfully!');
    setOpenModal(false);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const openTransactionDetailsModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setOpenTransactionModal(true);
  };

  const handleCloseTransactionModal = () => {
    setOpenTransactionModal(false);
    setSelectedTransaction(null);
  };

  const handleAllViewDetails = () => {
    navigate(`/admin/sales-report/view-all-transactions`);
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Graph data handling
  const graphData = transactions.length > 0
    ? transactions.map((transaction) => ({
        dateTime: transaction.dateTime,
        totalAmount: transaction.totalAmount,
      }))
    : [{ dateTime: 'No Data', totalAmount: 0 }];  // Placeholder data for empty case

  return (
    <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Sales Report
          </Typography>
          <Typography variant="body1">Summary of sales performance and insights.</Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => downloadReport(transactions)}
          sx={{
            backgroundColor: 'white',
            color: 'black',
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}
        >
          Download Report
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <TextField label="Date Range" type="date" InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="Medicine Group" select fullWidth>
              <MenuItem value="Group1">Group 1</MenuItem>
              <MenuItem value="Group2">Group 2</MenuItem>
              <MenuItem value="Group3">Group 3</MenuItem>
            </TextField>
            <TextField label="Branch" select fullWidth>
              <MenuItem value="Branch1">Branch 1</MenuItem>
              <MenuItem value="Branch2">Branch 2</MenuItem>
              <MenuItem value="Branch3">Branch 3</MenuItem>
            </TextField>
          </Box>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ backgroundColor: 'white', p: 3, height: 300 }}>
              <Typography variant="h6">Sales Made</Typography>
              <Divider sx={{ my: 2 }} />
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={graphData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dateTime" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="totalAmount"
                    stroke="#8884d8"
                    fillOpacity={0.3}
                    fill="#8884d8"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ backgroundColor: 'white', p: 3 }}>
              <Typography variant="h6">Latest Transactions</Typography>
              <Divider sx={{ my: 2 }} />
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Total Amount</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.orderId}>
                      <TableCell>{transaction.orderId}</TableCell>
                      <TableCell>{transaction.dateTime}</TableCell>
                      <TableCell>{transaction.totalAmount}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => openTransactionDetailsModal(transaction)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => setTransactionToDelete(transaction)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Grid>
        </Grid>
      </Grid>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, width: 400, mx: 'auto', mt: 10 }}>
          <Typography variant="h6">Confirm Deletion</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography>
            Are you sure you want to delete the transaction with Order ID: {transactionToDelete?.orderId}?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => transactionToDelete && handleDelete(transactionToDelete.orderId)}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={openTransactionModal} onClose={handleCloseTransactionModal}>
        <Box sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, width: 400, mx: 'auto', mt: 10 }}>
          <Typography variant="h6">Transaction Details</Typography>
          <Divider sx={{ my: 2 }} />
          {selectedTransaction && (
            <>
              <Typography>
                <strong>Order ID:</strong> {selectedTransaction.orderId}
              </Typography>
              <Typography>
                <strong>Total Amount:</strong> {selectedTransaction.totalAmount}
              </Typography>
              <Typography>
                <strong>Date:</strong> {selectedTransaction.dateTime}
              </Typography>
            </>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="outlined" onClick={handleCloseTransactionModal}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      {successMessage && (
        <Alert
          severity="success"
          icon={<CheckIcon />}
          sx={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)' }}
        >
          {successMessage}
        </Alert>
      )}
    </Box>
  );
};

export default ReportsPage;
