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
  Paper,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
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
                <TableCell>Item</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Subtotal</TableCell>
                <TableCell align="center">Action</TableCell>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {Boolean(item.requiresPrescription) && (
                          <Tooltip title="This item requires a prescription. Use F6 to add prescription details.">
                            <MedicalInformationIcon 
                              color="warning"
                              sx={{ 
                                flexShrink: 0,
                                animation: 'pulse 2s infinite',
                                '@keyframes pulse': {
                                  '0%': { opacity: 1 },
                                  '50%': { opacity: 0.6 },
                                  '100%': { opacity: 1 },
                                }
                              }}
                            />
                          </Tooltip>
                        )}
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.brand_name} • {item.category_name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      ₱{Number(item.price).toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">
                      ₱{Number(item.price * item.quantity).toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityEdit(item)}
                        color={item.requiresPrescription ? "warning" : "primary"}
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
