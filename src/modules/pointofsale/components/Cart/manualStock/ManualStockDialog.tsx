import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography
} from '@mui/material';

interface ManualStockDialogProps {
  open: boolean;
  onClose: () => void;
  onSetQuantity: (quantity: number) => void;
}

export const ManualStockDialog: React.FC<ManualStockDialogProps> = ({
  open,
  onClose,
  onSetQuantity
}) => {
  const [quantity, setQuantity] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const qty = parseInt(quantity);
    if (!isNaN(qty) && qty > 0) {
      onSetQuantity(qty);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Set Manual Quantity</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Set the quantity for the next item to be added
        </Typography>
        <TextField
          autoFocus
          fullWidth
          label="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/g, ''))}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          inputRef={inputRef}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!quantity}
        >
          Set Quantity
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 