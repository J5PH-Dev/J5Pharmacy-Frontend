import React from 'react';
import { Box, Paper, Typography, Button, Grid, TextField } from '@mui/material';

const UserManagementPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">User Management</Typography>
        <Button variant="contained" color="primary">
          Add User
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Search Users"
                variant="outlined"
                size="small"
                sx={{ width: 300 }}
              />
              <Button variant="outlined">
                Filter by Role
              </Button>
            </Box>
            {/* Add users table here */}
            <Typography color="textSecondary">
              User list will be displayed here
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Role Distribution
            </Typography>
            {/* Add role distribution chart here */}
            <Typography color="textSecondary">
              Role distribution chart will be displayed here
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            {/* Add recent activities list here */}
            <Typography color="textSecondary">
              Recent user activities will be displayed here
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserManagementPage;
