import React, { useRef, useState, useEffect } from 'react';
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

export default function Cart({ items }: CartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  // Auto scroll to bottom when items change
  useEffect(() => {
    if (containerRef.current && items.length > 0) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [items]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.pageY - (containerRef.current?.offsetTop || 0));
    setScrollTop(containerRef.current?.scrollTop || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const y = e.pageY - (containerRef.current?.offsetTop || 0);
    const walk = (y - startY) * 2; // Scroll speed multiplier
    if (containerRef.current) {
      containerRef.current.scrollTop = scrollTop - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        sx={{
          flex: 1,
          overflow: 'auto',
          userSelect: 'none', // Prevent text selection while dragging
          '&::-webkit-scrollbar': {
            width: '18px',
            height: '12px', 
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme => alpha(theme.palette.grey[200], 0.8),
            borderRadius: '6px',
            margin: 1,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme => alpha(theme.palette.primary.light, 0.5),
            borderRadius: '8px',
            border: '5px solid transparent',
            backgroundClip: 'padding-box',
            '&:hover': {
              backgroundColor: theme => alpha(theme.palette.primary.light, 0.9),
              border: '6px solid transparent',
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
                  {(item.price * item.quantity).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'PHP'
                  })}
                </StyledTableCell>
              </StyledTableRow>
            ))}
            <TableRow>
              <StyledTableCell colSpan={9} sx={{ border: 0, p: 0.5 }} />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
