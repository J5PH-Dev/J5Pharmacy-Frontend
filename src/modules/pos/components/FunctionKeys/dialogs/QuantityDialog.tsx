import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface QuantityDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  currentQuantity: number;
}

const QuantityDialog: React.FC<QuantityDialogProps> = ({
  open,
  onClose,
  onConfirm,
  currentQuantity
}) => {
  const [quantity, setQuantity] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset quantity and select text when dialog opens
  useEffect(() => {
    if (open) {
      setQuantity('');
      // Use setTimeout to ensure the input is mounted
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  }, [open]);

  const handleConfirm = () => {
    const parsedQuantity = parseInt(quantity || '1');
    if (!isNaN(parsedQuantity) && parsedQuantity > 0) {
      onConfirm(parsedQuantity);
      onClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleConfirm();
    } else if (event.key === 'Escape') {
      onConfirm(1);
      onClose();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const current = parseInt(quantity) || 0;
      setQuantity((current + 1).toString());
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const current = parseInt(quantity) || 2;
      setQuantity(Math.max(1, current - 1).toString());
    } else if (/^\d$/.test(event.key)) {
      // For numeric input, append the digit
      event.preventDefault();
      if (quantity === '0') {
        setQuantity(event.key);
      } else {
        setQuantity(prev => prev + event.key);
      }
    } else if (event.key === 'Backspace') {
      // Handle backspace to remove last digit
      event.preventDefault();
      const newValue = quantity.slice(0, -1);
      setQuantity(newValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      // Prevent leading zeros unless it's empty
      if (value === '' || (value !== '0' && !value.startsWith('0'))) {
        setQuantity(value);
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Set Quantity</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          alignItems: 'center',
          bgcolor: 'info.light',
          color: 'info.contrastText',
          p: 1,
          borderRadius: 1,
          mb: 2
        }}>
          <Typography variant="body2" sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <span><strong>↑↓</strong> Adjust Value</span>
            <span><strong>Enter</strong> Confirm</span>
            <span><strong>Esc</strong> Reset & Close</span>
            <span><strong>Type</strong> Set Value</span>
          </Typography>
        </Box>
        <TextField
          inputRef={inputRef}
          autoFocus
          fullWidth
          label="Quantity"
          value={quantity}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          type="number"
          placeholder="1"
          inputProps={{ 
            min: 1,
            style: { fontSize: '1.5rem', textAlign: 'center' }
          }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuantityDialog; 