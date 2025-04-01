import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { useNotification } from '../../../contexts/NotificationContext';

interface NewTransactionProps {
  open: boolean;
  onClose: () => void;
  currentItems: any[];
  onNewTransaction: () => void;
}

const NewTransaction: React.FC<NewTransactionProps> = ({
  open,
  onClose,
  currentItems,
  onNewTransaction
}) => {
  const { showNotification } = useNotification();

  const handleNewTransaction = () => {
    onNewTransaction(); // This will be handled by POSPage
    showNotification('Started new transaction', 'success');
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleNewTransaction();
    } else if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      onKeyDown={handleKeyDown}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>New Transaction</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography gutterBottom>
            Are you sure you want to start a new transaction?
          </Typography>
          {currentItems.length > 0 && (
            <Typography color="error.main">
              Warning: Current transaction has {currentItems.length} item(s) and will be cleared.
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel (ESC)
        </Button>
        <Button 
          onClick={handleNewTransaction} 
          variant="contained"
          color="primary"
        >
          Confirm (Enter)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewTransaction;
