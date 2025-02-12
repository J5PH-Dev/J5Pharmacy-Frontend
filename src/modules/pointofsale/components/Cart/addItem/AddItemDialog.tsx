import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Paper,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { CartItem } from '../../../types/cart';
import { useNotification } from '../../../contexts/NotificationContext';
import axios, { AxiosError } from 'axios';
import { useTheme } from '@mui/material/styles';

interface AddItemDialogProps {
  open: boolean;
  onClose: () => void;
  onAddProduct: (product: CartItem) => void;
  branchId: number;
  defaultQuantity: number;
}

export const AddItemDialog: React.FC<AddItemDialogProps> = ({
  open,
  onClose,
  onAddProduct,
  branchId,
  defaultQuantity
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [products, setProducts] = useState<CartItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { showNotification } = useNotification();
  const theme = useTheme();

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (products.length === 0) return;

    const validProducts = products.filter(p => p.stock > 0);
    if (validProducts.length === 0) return;

    switch (event.key) {
      case 'ArrowUp': {
        event.preventDefault();
        let newIndex = selectedIndex - 1;
        while (newIndex >= 0 && products[newIndex].stock <= 0) newIndex--;
        if (newIndex < 0) newIndex = products.length - 1;
        while (newIndex >= 0 && products[newIndex].stock <= 0) newIndex--;
        setSelectedIndex(newIndex >= 0 ? newIndex : selectedIndex);
        break;
      }
      case 'ArrowDown': {
        event.preventDefault();
        let newIndex = selectedIndex + 1;
        while (newIndex < products.length && products[newIndex].stock <= 0) newIndex++;
        if (newIndex >= products.length) newIndex = 0;
        while (newIndex < products.length && products[newIndex].stock <= 0) newIndex++;
        setSelectedIndex(newIndex < products.length ? newIndex : selectedIndex);
        break;
      }
      case 'Enter': {
        if (selectedIndex >= 0 && selectedIndex < products.length && products[selectedIndex].stock > 0) {
          handleAddProduct(products[selectedIndex]);
        }
        break;
      }
    }
  };

  // Reset selection when dialog opens/closes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [open, products]);

  // Clear search input and results when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchInput('');
      setProducts([]);
    }
  }, [open]);

  // Add scroll to selected item
  useEffect(() => {
    if (selectedIndex >= 0) {
      const selectedRow = document.getElementById(`product-row-${selectedIndex}`);
      selectedRow?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIndex]);

  const searchProducts = async (query: string) => {
    try {
      console.log('AddItem search initiated:', {
        query: query.toUpperCase(),
        branchId
      });

      const response = await axios.get(
        `http://localhost:5000/api/pos/search`,
        {
          params: {
            query: query.toUpperCase(),
            branchId: branchId
          },
          withCredentials: true
        }
      );

      console.log('AddItem search results:', {
        count: response.data.length,
        firstItem: response.data[0]
      });

      setProducts(response.data);
    } catch (error) {
      console.error('AddItem search error:', error);
      const axiosError = error as AxiosError<{ message: string }>;
      showNotification(
        axiosError.response?.data?.message || 'Failed to search products',
        'error'
      );
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toUpperCase();
    setSearchInput(value);
    
    if (value.length >= 3) {
      searchProducts(value);
    } else {
      setProducts([]);
    }
  };

  const handleKeyPress = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && searchInput) {
      // If it looks like a barcode (only numbers)
      if (/^\d+$/.test(searchInput)) {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/pos/barcode/${searchInput.toUpperCase()}`,
            {
              params: { branchId },
              withCredentials: true
            }
          );
          
          handleAddProduct(response.data);
          setSearchInput('');
          onClose();
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          showNotification(
            axiosError.response?.data?.message || 'Product not found',
            'error'
          );
        }
      }
    }
  };

  const handleAddProduct = async (product: CartItem) => {
    try {
      // Check current stock - use the correct API path
      const stockResponse = await axios.get(
        `http://localhost:5000/api/pos/search/stock/${branchId}/${product.id}`,
        { withCredentials: true }
      );

      const currentStock = stockResponse.data.stock;
      console.log('Stock check:', {
        productId: product.id,
        currentStock,
        defaultQuantity
      });

      if (defaultQuantity > currentStock) {
        showNotification(`Only ${currentStock} items available in stock`, 'error');
        return;
      }

      onAddProduct({
        ...product,
        quantity: defaultQuantity,
        stock: currentStock // Update with latest stock
      });
      
      onClose();
    } catch (error) {
      console.error('Error checking stock:', error);
      showNotification('Error checking stock availability', 'error');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      onKeyDown={handleKeyDown}
    >
      <DialogTitle>Add Item</DialogTitle>
      <DialogContent sx={{ 
        '& .MuiTable-root': {
          maxHeight: '60vh',
          overflow: 'auto',
          '& tr': {
            transition: 'background-color 0.2s ease'
          },
          '& tr.Mui-selected': {
            backgroundColor: theme.palette.action.selected,
            '&:hover': {
              backgroundColor: theme.palette.action.hover
            }
          }
        }
      }}>
        <TextField
          fullWidth
          autoFocus
          label="Search by name, brand, or scan barcode"
          value={searchInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            style: { textTransform: 'uppercase' }
          }}
        />

        {products.length > 0 && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Brand</TableCell>
                  <TableCell>Barcode</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow 
                    key={product.id}
                    hover={product.stock > 0}
                    selected={index === selectedIndex}
                    onClick={() => product.stock > 0 && handleAddProduct(product)}
                    sx={{
                      cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                      backgroundColor: index === selectedIndex ? 'action.selected' : 'inherit',
                      opacity: product.stock <= 0 ? 0.5 : 1,
                      '&:hover': {
                        backgroundColor: product.stock > 0 ? 'action.hover' : 'inherit'
                      }
                    }}
                    id={`product-row-${index}`}
                  >
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.brand_name}</TableCell>
                    <TableCell>{product.barcode}</TableCell>
                    <TableCell align="right">
                      ₱{Number(product.price).toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </TableCell>
                    <TableCell align="right" sx={{ color: product.stock <= 0 ? 'error.main' : 'inherit' }}>
                      {product.stock <= 0 ? 'Out of Stock' : product.stock}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => product.stock > 0 && handleAddProduct(product)}
                        disabled={product.stock <= 0}
                        sx={{ opacity: product.stock <= 0 ? 0.5 : 1 }}
                      >
                        <AddIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
}; 