import React, { useEffect, useRef } from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { CartItem } from '../../types';
import { StyledTableCell, StyledTableRow } from './styles';
import { alpha } from '@mui/material/styles';

interface CartProps {
  items: CartItem[];
}

const Cart: React.FC<CartProps> = ({ items }) => {
  const tableEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tableEndRef.current) {
      tableEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [items]);

  return (
    <Paper 
      elevation={2}
      sx={{ 
        height: { xs: '60vh', sm: '75vh', md: '85vh' },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          py: 1,
          px: 2,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h6" component="h2">
          Cart
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {items.length} items
        </Typography>
      </Box>
      
      <TableContainer 
        sx={{
          flex: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme => alpha(theme.palette.primary.main, 0.3),
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme => alpha(theme.palette.primary.main, 0.5),
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: theme => alpha(theme.palette.primary.main, 0.8),
            },
          },
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>Item Code</StyledTableCell>
              <StyledTableCell>Product Name</StyledTableCell>
              <StyledTableCell align="center">Rx</StyledTableCell>
              <StyledTableCell>Brand</StyledTableCell>
              <StyledTableCell>Category</StyledTableCell>
              <StyledTableCell>Dosage</StyledTableCell>
              <StyledTableCell align="right">Price</StyledTableCell>
              <StyledTableCell align="right">Qty</StyledTableCell>
              <StyledTableCell align="right">Amount</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <StyledTableRow key={`${item.itemCode}-${index}`}>
                <StyledTableCell>{item.itemCode}</StyledTableCell>
                <StyledTableCell>{item.productName}</StyledTableCell>
                <StyledTableCell align="center">
                  {item.requiresPrescription && (
                    <LocalHospitalIcon 
                      color="error" 
                      fontSize="small"
                      titleAccess="Requires Prescription"
                    />
                  )}
                </StyledTableCell>
                <StyledTableCell>{item.brand}</StyledTableCell>
                <StyledTableCell>{item.category}</StyledTableCell>
                <StyledTableCell>{item.dosage}</StyledTableCell>
                <StyledTableCell align="right">
                  {item.price.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'PHP'
                  })}
                </StyledTableCell>
                <StyledTableCell align="right">{item.quantity}</StyledTableCell>
                <StyledTableCell align="right">
                  {item.amount.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'PHP'
                  })}
                </StyledTableCell>
              </StyledTableRow>
            ))}
            <TableRow>
              <StyledTableCell colSpan={9} sx={{ border: 0, p: 0.5 }} ref={tableEndRef} />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default Cart;
