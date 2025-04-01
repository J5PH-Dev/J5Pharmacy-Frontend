import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider
} from '@mui/material';
import { CartItem } from '../../types/cart';

interface RecentProps {
  item: CartItem | null;
}

const Recent: React.FC<RecentProps> = ({ item }) => {
  if (!item) {
    return (
      <Box sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Recent Scanned Item
        </Typography>
        <Box 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <Typography color="text.secondary">
            No items scanned yet
          </Typography>
        </Box>
      </Box>
    );
  }

  const totalItems = item.quantity * (item.pieces_per_box || 1);

  return (
    <Box sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Recent Scanned Item
      </Typography>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          bgcolor: 'background.default',
          height: 'calc(100% - 40px)'
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" fontWeight="bold">
                {item.name}
              </Typography>
              <Typography 
                variant="h5" 
                fontFamily="monospace" 
                fontWeight="medium" 
                color="text.secondary"
              >
                {item.barcode}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary" variant="body2">
              Brand
            </Typography>
            <Typography variant="h6">
              {item.brand_name}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary" variant="body2">
              Category
            </Typography>
            <Typography variant="h6">
              {item.category_name}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid item xs={4}>
            <Typography color="text.secondary" variant="body2">
              Quantity
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {item.quantity}
              {item.pieces_per_box && (
                <Typography 
                  component="span" 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ ml: 1 }}
                >
                  ({totalItems} pieces)
                </Typography>
              )}
            </Typography>
          </Grid>

          <Grid item xs={4}>
            <Typography color="text.secondary" variant="body2">
              Unit Price
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              ₱{Number(item.price).toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </Typography>
          </Grid>

          <Grid item xs={4}>
            <Typography color="text.secondary" variant="body2">
              Subtotal
            </Typography>
            <Typography variant="h6" fontWeight="medium" color="primary.main">
              ₱{(item.price * item.quantity).toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid item xs={12}>
            <Typography color="text.secondary" variant="body2">
              Stock Level
            </Typography>
            <Typography 
              variant="h6"
              color={item.stock <= 10 ? 'error.main' : 'success.main'}
            >
              {item.stock} units
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Recent;
