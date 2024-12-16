import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  TextField, Typography, Box, ToggleButtonGroup, ToggleButton,
  InputAdornment
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import Inventory2Icon from '@mui/icons-material/Inventory2';

interface QuantityDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, isBox: boolean) => void;
  currentQuantity: number;
  pieces_per_box?: number;
}

const QuantityDialog: React.FC<QuantityDialogProps> = ({
  open,
  onClose,
  onConfirm,
  currentQuantity,
  pieces_per_box
}) => {
  const [quantity, setQuantity] = useState<string>('');
  const [isBox, setIsBox] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setQuantity('');
      setIsBox(false);
    }
  }, [open]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        // Reset to default and close
        onConfirm(1, false);
        onClose();
        break;
      case 'Enter':
        handleConfirm();
        break;
      case 'ArrowUp':
        event.preventDefault();
        handleIncrement();
        break;
      case 'ArrowDown':
        event.preventDefault();
        handleDecrement();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (pieces_per_box) setIsBox(false);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (pieces_per_box) setIsBox(true);
        break;
      case 'Backspace':
        // Allow backspace to work normally
        break;
      default:
        // Only allow numbers
        if (!/^\d$/.test(event.key) && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
        }
    }
  };

  const handleIncrement = () => {
    const current = parseInt(quantity || '1');
    setQuantity((current + 1).toString());
  };

  const handleDecrement = () => {
    const current = parseInt(quantity || '1');
    if (current > 1) {
      setQuantity((current - 1).toString());
    }
  };

  const handleConfirm = () => {
    const numericQuantity = parseInt(quantity || '1');
    if (numericQuantity > 0) {
      onConfirm(numericQuantity, isBox);
      onClose();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setQuantity(value);
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
      <DialogTitle>Set Quantity</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, bgcolor: 'info.light', color: 'info.contrastText', p: 1.5, borderRadius: 1 }}>
          <Typography variant="body2" component="div" sx={{ mb: 1 }}>
            <strong>Keyboard Shortcuts:</strong>
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Typography variant="body2">↑/↓: Adjust quantity</Typography>
            <Typography variant="body2">←/→: Switch unit</Typography>
            <Typography variant="body2">Enter: Confirm</Typography>
            <Typography variant="body2">Esc: Reset & close</Typography>
          </Box>
        </Box>

        <TextField
          autoFocus
          fullWidth
          placeholder="1"
          value={quantity}
          onChange={handleChange}
          type="text"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <KeyboardArrowUpIcon 
                    sx={{ cursor: 'pointer', fontSize: '1.2rem' }} 
                    onClick={handleIncrement}
                  />
                  <KeyboardArrowDownIcon 
                    sx={{ cursor: 'pointer', fontSize: '1.2rem' }} 
                    onClick={handleDecrement}
                  />
                </Box>
              </InputAdornment>
            )
          }}
        />

        {pieces_per_box && (
          <Box sx={{ mt: 2 }}>
            <ToggleButtonGroup
              value={isBox ? 'box' : 'piece'}
              exclusive
              onChange={(_, value) => value && setIsBox(value === 'box')}
              fullWidth
              size="large"
            >
              <ToggleButton 
                value="piece"
                sx={{ 
                  py: 1.5,
                  display: 'flex',
                  gap: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    }
                  }
                }}
              >
                <LocalOfferIcon />
                <Typography>Pieces</Typography>
              </ToggleButton>
              <ToggleButton 
                value="box"
                sx={{ 
                  py: 1.5,
                  display: 'flex',
                  gap: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    }
                  }
                }}
              >
                <Inventory2Icon />
                <Typography>Box</Typography>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuantityDialog; 