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
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { CartItem } from '../../../types/cart';
import { sampleItems } from '../../../../../devtools/sampleData';

interface ProductInquiryDialogProps {
  open: boolean;
  onClose: () => void;
}

const ProductInquiryDialog: React.FC<ProductInquiryDialogProps> = ({
  open,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<CartItem[]>([]);
  const MIN_SEARCH_LENGTH = 3;

  // Search function that filters products based on search term
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (term.length >= MIN_SEARCH_LENGTH) {
      const results = sampleItems.filter(item =>
        item.name.toLowerCase().includes(term.toLowerCase()) ||
        item.category.toLowerCase().includes(term.toLowerCase()) ||
        (item.barcode && item.barcode.toLowerCase().includes(term.toLowerCase()))
      );
      setSearchResults(results);
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
            ) : searchResults.length === 0 ? (
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
                      sx={{ fontSize: '1rem' }}
                    />
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
                        {product.barcode && (
                          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, fontSize: '1.1rem' }}>
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

export default ProductInquiryDialog; 