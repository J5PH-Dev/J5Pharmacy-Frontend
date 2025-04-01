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
      setQuantity(''); // Reset the input
      onClose();
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => {
        setQuantity(''); // Reset on close
        onClose();
      }}
    >
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
          onKeyPress={handleKeyPress}
          inputRef={inputRef}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => {
            setQuantity('');
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!quantity || parseInt(quantity) <= 0}
        >
          Set Quantity
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 