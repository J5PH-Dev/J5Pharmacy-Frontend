import React from 'react';
import { Box, Paper, Typography, Button, Grid, TextField } from '@mui/material';

const InventoryPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Inventory Management</Typography>
        <Box>
          <Button variant="contained" color="primary" sx={{ mr: 2 }}>
            Add Product
          </Button>
          <Button variant="outlined">
            Import Inventory
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Search Products"
                variant="outlined"
                size="small"
                sx={{ width: 300 }}
              />
              <Button variant="outlined">
                Filter
              </Button>
            </Box>
            {/* Add inventory table here */}
            <Typography color="textSecondary">
              Inventory list will be displayed here
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InventoryPage;
