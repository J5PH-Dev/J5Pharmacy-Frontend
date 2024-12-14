import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  IconButton,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Transaction } from '../../../types/transaction';
import { devStorage } from '../../../../../devtools/storage';

interface ProcessReturnDialogProps {
  open: boolean;
  onClose: () => void;
  onProcessReturn: (transaction: Transaction) => void;
}

export const ProcessReturnDialog: React.FC<ProcessReturnDialogProps> = ({
  open,
  onClose,
  onProcessReturn
}) => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    const transactions = devStorage.getTransactions();
    const found = transactions.find(t => t.id === invoiceNumber);
    
    if (found) {
      setTransaction(found);
      setError(null);
    } else {
      setTransaction(null);
      setError('Transaction not found');
    }
  };

  const handleReturn = () => {
    if (transaction) {
      onProcessReturn(transaction);
      onClose();
      setInvoiceNumber('');
      setTransaction(null);
      setError(null);
    }
  };

  const handleClose = () => {
    onClose();
    setInvoiceNumber('');
    setTransaction(null);
    setError(null);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Process Return</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              autoFocus
              fullWidth
              label="Invoice Number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Enter invoice number (e.g., 20240115-0001)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <IconButton onClick={handleSearch} color="primary" sx={{ ml: 1 }}>
              <SearchIcon />
            </IconButton>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {transaction && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Transaction Details
              </Typography>
              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                <Typography variant="body1">
                  Date: {new Date(transaction.timestamp).toLocaleString()}
                </Typography>
                <Typography variant="body1">
                  Total Amount: ₱{transaction.total.toFixed(2)}
                </Typography>
                {transaction.customerName && (
                  <Typography variant="body1">
                    Customer: {transaction.customerName}
                  </Typography>
                )}
              </Box>

              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Items
              </Typography>
              <List>
                {transaction.items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem>
                      <ListItemText
                        primary={item.name}
                        secondary={
                          <>
                            <Typography variant="body2">
                              Quantity: {item.quantity} × ₱{item.price.toFixed(2)}
                            </Typography>
                            <Typography variant="body2">
                              Subtotal: ₱{(item.quantity * item.price).toFixed(2)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < transaction.items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleReturn}
          variant="contained"
          color="primary"
          disabled={!transaction}
        >
          Process Return
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 