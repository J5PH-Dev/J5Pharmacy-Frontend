import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const AttendancePage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Attendance Management
        </Typography>
        <Typography variant="body1">
          Attendance tracking and management system coming soon.
        </Typography>
      </Box>
    </Container>
  );
};

export default AttendancePage;
