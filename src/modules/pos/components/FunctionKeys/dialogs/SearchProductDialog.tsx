import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { CartItem } from '../../../types/cart';
import { usePOS } from '../../../contexts/POSContext';

interface SearchProductDialogProps {
  open: boolean;
  onClose: () => void;
}

const SearchProductDialog: React.FC<SearchProductDialogProps> = ({
  open,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { searchProducts, showNotification } = usePOS();
  const MIN_SEARCH_LENGTH = 3;

  // Search function that uses the API
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (term.length >= MIN_SEARCH_LENGTH) {
      setIsLoading(true);
      try {
        const results = await searchProducts(term);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        showNotification('Failed to search products', 'error', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelect = (product: CartItem) => {
    onClose();
  };

  // Clear search results when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSearchResults([]);
    }
  }, [open]);

  const getStockStatus = (product: CartItem) => {
    if (!product.is_in_branch) {
      return {
        label: 'Not Available in Branch',
        color: 'warning' as const,
        variant: 'outlined' as const
      };
    }
    if (product.stock <= 0) {
      return {
        label: 'Out of Stock',
        color: 'error' as const,
        variant: 'outlined' as const
      };
    }
    return null;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <SearchIcon />
            <Typography variant="h6">Product Inquiry</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          placeholder="Search by name, category, or barcode..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: isLoading && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            )
          }}
        />

        {searchTerm.length > 0 && (
          <Box sx={{ mt: 2, mb: 1 }}>
            {searchTerm.length < MIN_SEARCH_LENGTH ? (
              <Typography 
                variant="body2" 
                color="warning.main"
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}
              >
                Please enter at least {MIN_SEARCH_LENGTH} characters to search
                ({MIN_SEARCH_LENGTH - searchTerm.length} more to go)
              </Typography>
            ) : searchResults.length === 0 && !isLoading ? (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}
              >
                No products found
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        <List>
          {searchResults.map((product) => (
            <ListItem 
              key={product.id}
              divider
              sx={{
                borderRadius: 1,
                mb: 1,
                opacity: !product.is_in_branch || product.stock <= 0 ? 0.7 : 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6" sx={{ fontSize: '1.3rem' }}>
                      {product.name}
                      <Typography 
                        component="span" 
                        color="text.secondary" 
                        sx={{ ml: 1, fontSize: '1.1rem' }}
                      >
                        ({product.brand_name})
                      </Typography>
                    </Typography>
                    <Chip 
                      label={product.requiresPrescription ? 'Rx' : 'OTC'} 
                      size="small"
                      color={product.requiresPrescription ? 'error' : 'success'}
                      sx={{ fontSize: '0.9rem' }}
                    />
                    {/* Stock status chip */}
                    {getStockStatus(product) && (
                      <Chip 
                        {...getStockStatus(product)}
                        size="small"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mt: 1 
                    }}>
                      <Box>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                          {product.category} • {product.dosage_amount}{product.dosage_unit}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color={product.stock > 0 ? 'text.secondary' : 'error.main'}
                        >
                          Stock: {product.stock} {product.pieces_per_box ? 
                            `(${Math.floor(product.stock / product.pieces_per_box)} boxes)` : 
                            'pcs'
                          }
                        </Typography>
                        {product.barcode && (
                          <Typography variant="body2" color="text.secondary">
                            Barcode: {product.barcode}
                          </Typography>
                        )}
                      </Box>
                      <Typography 
                        variant="h6" 
                        color="primary.main" 
                        sx={{ 
                          fontWeight: 700,
                          fontSize: '1.5rem',
                          ml: 2
                        }}
                      >
                        ₱{product.price.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="large">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchProductDialog; 