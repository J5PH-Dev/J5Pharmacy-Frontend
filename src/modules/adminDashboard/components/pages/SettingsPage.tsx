import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, Button, Divider, Dialog, DialogTitle, DialogContent, TextField } from '@mui/material';
import { AccountCircle, Info, Code } from '@mui/icons-material';

interface Setting {
  icon: JSX.Element;
  title: string;
  description: string;
  form?: JSX.Element;
}

const SettingsPage = () => {
  const [selectedSetting, setSelectedSetting] = useState<Setting | null>(null);

  // Email validation state and regex pattern
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [emailHelperText, setEmailHelperText] = useState('');

  // Function to handle email change and validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    // Simple email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/; // Gmail domain validation
    if (!emailPattern.test(newEmail)) {
      setEmailError(true);
      setEmailHelperText('Email should have @gmail.com');
    } else {
      setEmailError(false);
      setEmailHelperText('');
    }
  };

  // Settings data with icons and details
  const settingsData = [
    {
      icon: <AccountCircle sx={{ fontSize: 40 }} />,
      title: 'Account Settings',
      description: 'Update your email, password, and profile information.',
      form: (
        <Box component="form" noValidate autoComplete="off">
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={email}
            onChange={handleEmailChange}
            error={emailError}
            helperText={emailHelperText}
          />
          <TextField fullWidth label="Password" type="password" margin="normal" />
          <TextField fullWidth label="Username" margin="normal" />
          <Button variant="contained" sx={{ marginTop: 2 }}>
            Update
          </Button>
        </Box>
      ),
    },
    {
      icon: <Info sx={{ fontSize: 40 }} />,
      title: 'About',
      description: 'Learn more about the app and its features.',
      form: (
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
            About J5 Pharmacy Management System
          </Typography>
          <Typography variant="body1" paragraph>
            J5 Pharmacy is a comprehensive management system designed specifically for pharmacies. It integrates various modules to handle different aspects of pharmacy operations, including Point of Sale (POS), Pharmacy Management System (PMS), Inventory Management, and more.
          </Typography>
        </Box>
      ),
    },
    {
      icon: <Code sx={{ fontSize: 40 }} />,
      title: 'Version',
      description: 'View app version and release details.',
      form: (
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
            Version Information
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Main Version: Beta
          </Typography>
          <Divider sx={{ marginBottom: 2 }} />

          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Component Versions:
          </Typography>

          <Box sx={{ marginTop: 2 }}>
            <Typography variant="body1">POS: Beta 0.2.4-d</Typography>
            <Typography variant="body1">Admin: Beta 0.1.0</Typography>
            <Typography variant="body1">Analytics: Beta 0.1.0</Typography>
            <Typography variant="body1">Attendance: Beta 0.1.0</Typography>
            <Typography variant="body1">Branch: Beta 0.1.0</Typography>
            <Typography variant="body1">Customers: Beta 0.1.0</Typography>
            <Typography variant="body1">Dashboard: Beta 0.2.1</Typography>
            <Typography variant="body1">Inventory: Beta 0.1.0</Typography>
            <Typography variant="body1">Authentication: Beta 0.1.0</Typography>
          </Box>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>
      {/* Title Section */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Settings
          </Typography>
          <Typography variant="body1" sx={{ mt: -1 }}>
            Manage your app settings and preferences.
          </Typography>
        </Box>
      </Box>

      {/* Divider */}
      <Divider sx={{ mb: 4 }} />

      {/* Settings Cards */}
      <Grid container spacing={3} sx={{ justifyContent: { xs: 'center', sm: 'flex-start' } }}>
        {settingsData.map((setting, index) => (
          <Grid key={index} item xs={12} sm={6} md={4}>
            <Paper
              sx={(theme) => ({
                height: 220,
                backgroundColor: '#fff',
                border: `1px solid #ccc`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: theme.spacing(2),
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.01)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                },
              })}
              onClick={() => setSelectedSetting(setting)}
            >
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                {React.cloneElement(setting.icon, { sx: { fontSize: 40, color: '#000' } })}
                <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', mt: 1 }}>
                  {setting.title}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                  {setting.description}
                </Typography>
              </div>

              <Button
                sx={{
                  backgroundColor: '#03A9F5',
                  color: '#fff',
                  width: '100%',
                  textTransform: 'none',
                  borderRadius: 1,
                  marginTop: 'auto',
                  '&:hover': {
                    backgroundColor: '#03A9F599',
                  },
                }}
              >
                Open {setting.title}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Dialog for Forms */}
      {selectedSetting && (
        <Dialog open={Boolean(selectedSetting)} onClose={() => setSelectedSetting(null)} fullWidth maxWidth="sm">
          <DialogTitle>{selectedSetting.title}</DialogTitle>
          <DialogContent>{selectedSetting.form}</DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default SettingsPage;