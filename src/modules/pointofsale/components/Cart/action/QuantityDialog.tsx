import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { CartItem } from '../../../types/cart';
import axios from 'axios';
import { useNotification } from '../../../contexts/NotificationContext';

interface QuantityDialogProps {
  open: boolean;
  onClose: () => void;
  item: CartItem;
  branchId: number;
  onConfirm: (item: CartItem, newQuantity: number) => void;
}

export const QuantityDialog: React.FC<QuantityDialogProps> = ({
  open,
  onClose,
  item,
  branchId,
  onConfirm
}) => {
  const [quantity, setQuantity] = useState<string>('');
  const [maxStock, setMaxStock] = useState<number>(0);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (open && item) {
      setQuantity(item.quantity.toString());
      fetchCurrentStock();
    }
  }, [open, item]);

  const fetchCurrentStock = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/pos/search/stock/${branchId}/${item.id}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        const currentStock = response.data.stock;
        setMaxStock(currentStock);
        console.log('Stock check for quantity edit:', {
          productId: item.id,
          productName: item.name,
          currentStock,
          currentQuantity: item.quantity
        });
      } else {
        throw new Error('Failed to fetch stock information');
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
      showNotification('Error fetching stock information', 'error');
      onClose();
    }
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(value);
    
    // Allow empty value for typing
    if (value === '') {
      setQuantity('');
      return;
    }

    // Check if it's within stock limits
    if (!isNaN(numValue)) {
      if (numValue <= maxStock + item.quantity) { // Allow current quantity plus available stock
        setQuantity(value);
      } else {
        showNotification(`Maximum available quantity is ${maxStock + item.quantity}`, 'warning');
      }
    }
  };

  const handleConfirm = () => {
    const newQuantity = parseInt(quantity);
    
    if (isNaN(newQuantity)) {
      showNotification('Please enter a valid quantity', 'error');
      return;
    }

    if (newQuantity === 0) {
      // Confirm removal
      if (window.confirm('Are you sure you want to remove this item?')) {
        onConfirm(item, 0);
        onClose();
      }
      return;
    }

    // Calculate the difference from current quantity
    const quantityDifference = newQuantity - item.quantity;
    
    // Check if the additional quantity is available in stock
    if (quantityDifference > maxStock) {
      showNotification(`Cannot add ${quantityDifference} more items. Only ${maxStock} available in stock`, 'error');
      return;
    }

    onConfirm(item, newQuantity);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Edit Quantity</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {item?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {item?.brand_name}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Current Quantity: {item?.quantity}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Available Stock: {maxStock}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Maximum Allowed: {maxStock + item?.quantity}
            </Typography>
          </Box>
          <TextField
            fullWidth
            label="New Quantity"
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            InputProps={{
              inputProps: { 
                min: 0,
                max: maxStock + (item?.quantity || 0)
              }
            }}
            helperText={`Enter 0 to remove item. Maximum allowed: ${maxStock + (item?.quantity || 0)}`}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm}
          variant="contained"
          disabled={!quantity || isNaN(parseInt(quantity))}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuantityDialog;
