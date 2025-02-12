import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { CartItem } from '../../types/cart';
import { QuantityDialog } from './action/QuantityDialog';

interface CartProps {
  items: CartItem[];
  onRemoveItem: (itemId: number) => void;
  onEditQuantity: (item: CartItem) => void;
  branchId: number;
}

const Cart: React.FC<CartProps> = ({
  items,
  onRemoveItem,
  onEditQuantity,
  branchId
}) => {
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [openQuantityDialog, setOpenQuantityDialog] = useState(false);

  const handleQuantityEdit = (item: CartItem) => {
    setSelectedItem(item);
    setOpenQuantityDialog(true);
  };

  const handleQuantityConfirm = (item: CartItem, newQuantity: number) => {
    if (newQuantity === 0) {
      onRemoveItem(item.id);
    } else {
      // Create updated item with new quantity and subtotal
      const updatedItem = {
        ...item,
        quantity: newQuantity,
        subtotal: item.price * newQuantity
      };
      
      console.log('Updating item quantity:', {
        itemId: item.id,
        oldQuantity: item.quantity,
        newQuantity,
        updatedItem
      });

      onEditQuantity(updatedItem);
    }
    setOpenQuantityDialog(false);
  };

  return (
    <>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">
            Current Transaction
          </Typography>
        </Box>

        <TableContainer component={Paper} sx={{ flex: 1, overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell align="center">Quantity</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Subtotal</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      No items in cart
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.brand_name} • {item.category_name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {item.quantity}
                    </TableCell>
                    <TableCell align="right">
                      ₱{Number(item.price).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      ₱{(Number(item.price) * item.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityEdit(item)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onRemoveItem(item.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      
      {selectedItem && (
        <QuantityDialog
          open={openQuantityDialog}
          onClose={() => setOpenQuantityDialog(false)}
          item={selectedItem}
          branchId={branchId}
          onConfirm={handleQuantityConfirm}
        />
      )}
    </>
  );
};

export default Cart;
