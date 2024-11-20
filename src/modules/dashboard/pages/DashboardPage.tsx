import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

const DashboardPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Sales Overview</Typography>
            {/* Add sales charts/stats here */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Inventory Status</Typography>
            {/* Add inventory summary here */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Recent Transactions</Typography>
            {/* Add recent transactions list here */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
