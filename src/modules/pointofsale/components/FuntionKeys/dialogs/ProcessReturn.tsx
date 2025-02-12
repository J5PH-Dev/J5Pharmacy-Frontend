import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UndoIcon from '@mui/icons-material/Undo';
import { useNotification } from '../../../contexts/NotificationContext';

interface ProcessReturnProps {
  open: boolean;
  onClose: () => void;
}

interface ReturnItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  returnQuantity?: number;
}

interface Transaction {
  id: string;
  items: ReturnItem[];
  total: number;
  date: string;
}

const ProcessReturn: React.FC<ProcessReturnProps> = ({
  open,
  onClose
}) => {
  const { showNotification } = useNotification();
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [reason, setReason] = useState('');

  const handleSearch = async () => {
    if (!transactionId.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/transactions/${transactionId}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Transaction not found');
      }

      const data = await response.json();
      setTransaction(data);
      setReturnItems(data.items.map((item: ReturnItem) => ({ ...item, returnQuantity: 0 })));
    } catch (error) {
      console.error('Error fetching transaction:', error);
      showNotification('Transaction not found', 'error');
      setTransaction(null);
      setReturnItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnQuantityChange = (itemId: number, value: string) => {
    const quantity = parseInt(value) || 0;
    setReturnItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          returnQuantity: Math.min(Math.max(0, quantity), item.quantity)
        };
      }
      return item;
    }));
  };

  const handleProcessReturn = async () => {
    try {
      const itemsToReturn = returnItems.filter(item => (item.returnQuantity || 0) > 0);
      
      if (itemsToReturn.length === 0) {
        showNotification('Please select items to return', 'error');
        return;
      }

      if (!reason.trim()) {
        showNotification('Please provide a reason for return', 'error');
        return;
      }

      const response = await fetch('http://localhost:5000/api/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          items: itemsToReturn,
          reason,
          timestamp: new Date().toISOString()
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to process return');
      }

      showNotification('Return processed successfully', 'success');
      setTransaction(null);
      setReturnItems([]);
      setReason('');
      onClose();
    } catch (error) {
      console.error('Error processing return:', error);
      showNotification('Failed to process return', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Process Return</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearch} disabled={loading}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {loading ? (
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Grid>
            ) : transaction ? (
              <>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Transaction Details
                    </Typography>
                    <Typography variant="body2">
                      Date: {new Date(transaction.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      Total Amount: ₱{transaction.total.toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Purchased Qty</TableCell>
                          <TableCell align="right">Return Qty</TableCell>
                          <TableCell align="right">Return Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {returnItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="right">₱{item.price.toFixed(2)}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                value={item.returnQuantity || ''}
                                onChange={(e) => handleReturnQuantityChange(item.id, e.target.value)}
                                inputProps={{ min: 0, max: item.quantity }}
                                size="small"
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              ₱{((item.returnQuantity || 0) * item.price).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason for Return"
                    multiline
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </Grid>
              </>
            ) : null}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleProcessReturn}
          color="primary"
          variant="contained"
          disabled={!transaction || returnItems.every(item => !item.returnQuantity)}
          startIcon={<UndoIcon />}
        >
          Process Return
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProcessReturn;
