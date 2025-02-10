import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
  Box,
  Typography,
  CircularProgress,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import { CartItem } from '../../../types/cart';
import { useNotification } from '../../../contexts/NotificationContext';
import axios, { AxiosError } from 'axios';

interface SearchProductProps {
  open: boolean;
  onClose: () => void;
  onAddProduct: (product: CartItem) => void;
  branchId: number;
}

const SearchProduct: React.FC<SearchProductProps> = ({
  open,
  onClose,
  onAddProduct,
  branchId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<CartItem[]>([]);
  const { showNotification } = useNotification();
  const [hasSearched, setHasSearched] = useState(false);

  // Clear search query and results when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setProducts([]);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const input = document.getElementById('search-product-input');
        input?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSearch = async () => {
    if (searchQuery.length < 3) {
      showNotification('Please enter at least 3 characters', 'warning');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      console.log('Initiating product search:', {
        query: searchQuery,
        branchId
      });

      const response = await axios.get(
        `http://localhost:5000/api/pos/search`,
        {
          params: {
            query: searchQuery,
            branchId: branchId
          },
          withCredentials: true
        }
      );

      console.log('Search results received:', {
        count: response.data.length,
        firstItem: response.data[0]
      });

      setProducts(response.data);
    } catch (error) {
      console.error('Search error:', error);
      const axiosError = error as AxiosError<{ message: string }>;
      showNotification(
        axiosError.response?.data?.message || 'Failed to search products',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddProduct = (product: CartItem) => {
    onAddProduct(product);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Search Product</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            autoFocus
            label="Search products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            helperText="Enter at least 3 characters to search"
          />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : products.length > 0 ? (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Barcode</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow 
                    key={product.id}
                    hover={product.stock > 0}
                    sx={{
                      cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                      opacity: product.stock <= 0 ? 0.5 : 1
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {Boolean(product.requiresPrescription) && (
                          <Tooltip title="This item requires a prescription. Please use F6 to add prescription details.">
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
                            {product.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {product.brand_name} • {product.category_name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{product.barcode}</TableCell>
                    <TableCell align="right">
                      ₱{Number(product.price).toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        color: product.stock <= 0 ? 'error.main' : 'inherit'
                      }}
                    >
                      {product.stock <= 0 ? 'Out of Stock' : product.stock}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={
                        product.requiresPrescription 
                          ? "This item requires a prescription"
                          : "Add to cart"
                      }>

                        <span>
                          <IconButton
                            onClick={() => handleAddProduct(product)}
                            disabled={product.stock <= 0}
                            color={product.requiresPrescription ? "warning" : "primary"}
                          >
                            <AddIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
            {hasSearched ? 'No products found' : 'Search for products to begin'}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button onClick={handleSearch} color="primary" variant="contained">
          Search
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchProduct;
