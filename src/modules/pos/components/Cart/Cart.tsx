import React, { useEffect, useRef } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip
} from '@mui/material';
import { CartItem } from '../../types/cart';

interface CartProps {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
}

const Cart: React.FC<CartProps> = ({ items, setItems }) => {
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  // Calculate total quantity
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  // Scroll to bottom whenever items change
  useEffect(() => {
    if (tableContainerRef.current && items.length > 0) {
      const scrollContainer = tableContainerRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [items]);

  const getSkuChipColor = (sku: 'Piece' | 'Box') => {
    switch (sku) {
      case 'Piece':
        return 'secondary';
      case 'Box':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      maxHeight: '100%',
      overflow: 'hidden'
    }}>
      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Typography variant="h4" fontWeight="bold">
          Cart {items.length > 0 && `(${totalQuantity} items)`}
        </Typography>
      </Box>
      
      <TableContainer 
        component={Paper} 
        elevation={0}
        ref={tableContainerRef}
        sx={{ 
          flexGrow: 1,
          minHeight: 0,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'background.paper',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'primary.light',
            borderRadius: '4px',
          },
        }}
      >
        <Table stickyHeader size="medium">
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  backgroundColor: 'background.paper',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  py: 2.5,
                  width: '45%'
                }}
              >
                Product
              </TableCell>
              <TableCell 
                align="center"
                sx={{ 
                  backgroundColor: 'background.paper',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  py: 2.5,
                  width: '15%'
                }}
              >
                Quantity
              </TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  backgroundColor: 'background.paper',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  py: 2.5,
                  width: '20%'
                }}
              >
                Price
              </TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  backgroundColor: 'background.paper',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  py: 2.5,
                  width: '20%'
                }}
              >
                Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                  <Typography variant="h5" color="text.secondary">
                    Cart is empty
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow 
                  key={item.id} 
                  sx={{ 
                    '&:hover': { bgcolor: 'action.hover' },
                    bgcolor: index % 2 === 0 ? 'action.hover' : 'background.paper',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <TableCell sx={{ py: 2.5 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
                        {item.name}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        mt: 0.8,
                        flexWrap: 'wrap'
                      }}>
                        <Typography 
                          variant="body1" 
                          color="text.secondary"
                          sx={{ fontSize: '1.1rem' }}
                        >
                          {item.category} • {item.dosage_amount}{item.dosage_unit}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip 
                            label={item.SKU}
                            size="medium"
                            color={getSkuChipColor(item.SKU)}
                            variant="outlined"
                            sx={{ 
                              fontSize: '1rem',
                              height: 32,
                              borderRadius: '16px',
                              minWidth: '80px'
                            }}
                          />
                          {item.requiresPrescription && (
                            <Chip 
                              label="Rx"
                              size="medium"
                              color="error"
                              sx={{ 
                                fontSize: '1rem',
                                height: 32,
                                fontWeight: 'bold'
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: '1.25rem', py: 2.5 }}>
                    {item.quantity}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '1.25rem', py: 2.5 }}>
                    ₱{item.price.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '1.25rem', py: 2.5 }}>
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Cart;
