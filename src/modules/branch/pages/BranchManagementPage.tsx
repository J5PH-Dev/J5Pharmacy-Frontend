import React from 'react';
import { Box, Paper, Typography, Button, Grid } from '@mui/material';

const BranchManagementPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Branch Management</Typography>
        <Button variant="contained" color="primary">
          Add New Branch
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Branch List
            </Typography>
            {/* Add branch list table here */}
            <Typography color="textSecondary">
              Branch list will be displayed here
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BranchManagementPage;
