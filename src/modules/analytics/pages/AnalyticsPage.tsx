import React from 'react';
import { Box, Paper, Typography, Grid, Button } from '@mui/material';

const AnalyticsPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Analytics & Reports</Typography>
        <Button variant="outlined">
          Export Reports
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales Overview
            </Typography>
            {/* Add sales chart here */}
            <Typography color="textSecondary">
              Sales chart will be displayed here
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Key Metrics
            </Typography>
            {/* Add key metrics here */}
            <Typography color="textSecondary">
              Key metrics will be displayed here
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Selling Products
            </Typography>
            {/* Add top products list here */}
            <Typography color="textSecondary">
              Top selling products will be displayed here
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revenue by Branch
            </Typography>
            {/* Add branch revenue chart here */}
            <Typography color="textSecondary">
              Branch revenue chart will be displayed here
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
