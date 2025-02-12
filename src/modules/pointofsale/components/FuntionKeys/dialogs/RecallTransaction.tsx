import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Box,
  Tabs,
  Tab
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useNotification } from '../../../contexts/NotificationContext';
import { useAuth } from '../../../../auth/contexts/AuthContext';

interface HeldTransaction {
  id: number;
  hold_number: number;
  total_amount: number;
  created_at: string;
  customer_name: string;
  items_summary: string;
}

const RecallTransaction: React.FC<{
  open: boolean;
  onClose: () => void;
  onRecall: (items: any[]) => void;
}> = ({ open, onClose, onRecall }) => {
  const { showNotification } = useNotification();
  const { currentSession } = useAuth();
  const [transactions, setTransactions] = useState<HeldTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const fetchHeldTransactions = async (showAll = false) => {
    try {
      const url = `/api/pos/transactions/held/${currentSession?.salesSessionId}?showAll=${showAll}`;
      const response = await axios.get(url, { withCredentials: true });
      setTransactions(response.data.data);
    } catch (error) {
      showNotification('Failed to load held transactions', 'error');
    }
  };

  useEffect(() => {
    fetchHeldTransactions();
  }, [open, currentSession]);

  const handleRecall = async (transactionId: number) => {
    if (cartItems.length > 0) {
        const confirm = window.confirm(
            'Recalling this transaction will clear your current cart. Continue?'
        );
        if (!confirm) return;
    }
    try {
      const response = await axios.get(
        `/api/pos/transactions/held/${transactionId}/items`,
        { withCredentials: true }
      );
      
      // Transform items to CartItem format
      const recalledItems = response.data.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        barcode: item.barcode,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal
      }));
      
      onRecall(recalledItems);
      showNotification('Transaction recalled', 'success');
      onClose();
    } catch (error) {
      showNotification('Failed to recall transaction', 'error');
    }
  };

  const handleDelete = async (transactionId: number) => {
    try {
      await axios.delete(`/api/pos/transactions/held/${transactionId}`, {
        withCredentials: true
      });
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      showNotification('Held transaction deleted', 'success');
    } catch (error) {
      showNotification('Failed to delete transaction', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Recall Held Transactions</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newVal) => {
            setTabValue(newVal);
            fetchHeldTransactions(newVal === 1);
          }}>
            <Tab label="Active Holds" />
            <Tab label="Hold History" />
          </Tabs>
        </Box>
        {loading ? (
          <CircularProgress />
        ) : transactions.length === 0 ? (
          <Typography color="textSecondary" align="center" sx={{ p: 3 }}>
            No held transactions found
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Hold #</TableCell>
                  <TableCell>Time Held</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.hold_number}</TableCell>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {transaction.customer_name || 'Walk-in Customer'}
                    </TableCell>
                    <TableCell>{transaction.items_summary}</TableCell>
                    <TableCell align="right">
                      ₱{Number(transaction.total_amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleRecall(transaction.id)}
                        color="primary"
                        variant="outlined"
                        size="small"
                      >
                        Recall
                      </Button>
                      <IconButton
                        onClick={() => handleDelete(transaction.id)}
                        color="error"
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecallTransaction;
