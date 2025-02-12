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
import { CartItem } from '../../../types/cart';

interface NewTransactionProps {
  open: boolean;
  onClose: () => void;
  currentItems: CartItem[];
}

const NewTransaction: React.FC<NewTransactionProps> = ({
  open,
  onClose,
  currentItems
}) => {
  const handleConfirmNew = () => {
    // Add logic to clear current transaction
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Transaction</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          {currentItems.length > 0 ? (
            <Typography color="error">
              Warning: Starting a new transaction will clear the current cart. 
              Are you sure you want to continue?
            </Typography>
          ) : (
            <Typography>
              Start a new transaction?
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleConfirmNew} color="primary" variant="contained">
          Confirm New Transaction
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewTransaction;
