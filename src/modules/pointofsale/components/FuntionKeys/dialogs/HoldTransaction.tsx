import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import { useNotification } from '../../../contexts/NotificationContext';
import { CartItem } from '../../../types/cart';
import { useAuth } from '../../../../auth/contexts/AuthContext';

interface HoldTransactionProps {
  open: boolean;
  onClose: () => void;
  currentItems: CartItem[];
  currentTotal: number;
  onHoldSuccess: () => void;
}

const HoldTransaction: React.FC<HoldTransactionProps> = ({
  open,
  onClose,
  currentItems,
  currentTotal,
  onHoldSuccess
}) => {
  const { showNotification } = useNotification();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentSession } = useAuth();

  const handleHoldTransaction = async () => {
    if (!currentSession?.salesSessionId) {
      showNotification('No active sales session', 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to hold transaction with session:', {
        salesSessionId: currentSession?.salesSessionId,
        branchId: currentSession?.branchId,
        itemsCount: currentItems.length
      });

      const response = await axios.post('/api/pos/transactions/hold', {
        salesSessionId: currentSession.salesSessionId,
        branchId: currentSession.branchId,
        items: currentItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          subtotal: item.price * item.quantity
        })),
        totalAmount: currentTotal,
        note
      }, { withCredentials: true });

      showNotification(`Transaction held (Hold #${response.data.holdNumber})`, 'success');
      onClose();
      onHoldSuccess();
    } catch (error) {
      showNotification('Failed to hold transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Hold Current Transaction</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Total Items: {currentItems.length}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Total Amount: ₱{currentTotal.toFixed(2)}
        </Typography>
        <TextField
          fullWidth
          label="Add Note (Optional)"
          multiline
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleHoldTransaction}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Hold Transaction (F3)'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HoldTransaction;
