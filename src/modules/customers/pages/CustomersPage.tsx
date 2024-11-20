import React from 'react';
import { Box, Paper, Typography, Button, Grid, TextField } from '@mui/material';

const CustomersPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Customer Management</Typography>
        <Button variant="contained" color="primary">
          Add Customer
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Search Customers"
                variant="outlined"
                size="small"
                sx={{ width: 300 }}
              />
            </Box>
            {/* Add customers table here */}
            <Typography color="textSecondary">
              Customer list will be displayed here
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Customer Statistics
            </Typography>
            {/* Add customer statistics here */}
            <Typography color="textSecondary">
              Customer statistics will be displayed here
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomersPage;
