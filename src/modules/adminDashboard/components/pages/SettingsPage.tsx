import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, Button, Breadcrumbs, Link, Divider, Dialog, DialogTitle, DialogContent, TextField } from '@mui/material';
import { AccountCircle, Info, Code } from '@mui/icons-material';

interface Setting {
  icon: JSX.Element;
  title: string;
  description: string;
  form: JSX.Element;
}

const SettingsPage = () => {
  const [selectedSetting, setSelectedSetting] = useState<Setting | null>(null);

  // Settings data with icons, details, and forms
  const settingsData: Setting[] = [
    {
      icon: <AccountCircle sx={{ fontSize: 40 }} />,
      title: 'Account Settings',
      description: 'Update your email, password, and profile information.',
      form: (
        <Box component="form" noValidate autoComplete="off">
          <TextField fullWidth label="Email" margin="normal" />
          <TextField fullWidth label="Password" type="password" margin="normal" />
          <TextField fullWidth label="Username" margin="normal" />
          <Button
            variant="contained"
            sx={{ mt: 2, backgroundColor: '#03A9F5', '&:hover': { backgroundColor: '#03A9F599' } }}
            fullWidth
          >
            Update
          </Button>
        </Box>
      ),
    },
    {
      icon: <Info sx={{ fontSize: 40 }} />,
      title: 'About',
      description: 'Learn more about J5 Pharmacy Management System.',
      form: (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            About J5 Pharmacy Management System (PMS & POS)
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            The J5 Pharmacy Management System (PMS) is a comprehensive, integrated solution specifically designed for J5 Pharmacy. This system helps streamline and optimize the daily operations of the pharmacy, ensuring efficient management of pharmacy tasks such as inventory control, patient prescriptions, billing, and sales tracking. The system is tailored for the needs of J5 Pharmacy, providing an intuitive interface for both pharmacists and customers.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            The J5 Pharmacy system also includes a Point of Sale (POS) feature, which simplifies the sales process by offering a seamless checkout experience. It integrates directly with the inventory system, enabling real-time tracking of stock levels and ensuring that sales transactions are automatically recorded and updated.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Key Features:
          </Typography>
          <ul>
            <li>Pharmacy Management System (PMS) for managing prescriptions, inventory, and customer data.</li>
            <li>Point of Sale (POS) for quick and accurate billing, and sales tracking.</li>
            <li>Real-time inventory updates during sales transactions.</li>
            <li>Prescription tracking and automated alerts for refills.</li>
            <li>Detailed reporting and analytics for pharmacy operations.</li>
          </ul>
          <Typography variant="body1" sx={{ mt: 2 }}>
            By integrating PMS and POS into a single platform, J5 Pharmacy's system enhances operational efficiency, reduces errors, and provides a smoother customer experience. It's a complete solution designed to address the specific needs of J5 Pharmacy's operations.
          </Typography>
        </Box>
      ),
    },
    {
      icon: <Code sx={{ fontSize: 40 }} />,
      title: 'Version',
      description: 'View app version and release details.',
      form: (
        <Typography variant="body1">
          App Version: 1.0.0 <br />
          Release Date: December 2024
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>
      {/* Breadcrumbs */}
      {selectedSetting && (
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: { xs: 'center', sm: 'flex-start' },
            textAlign: { xs: 'center', sm: 'left' },
            width: '100%',
          }}
        >
          <Link color="inherit" href="/" onClick={() => setSelectedSetting(null)}>
            Settings
          </Link>
          <Typography color="text.primary">{selectedSetting.title}</Typography>
        </Breadcrumbs>
      )}

      {/* Title Section */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            {selectedSetting ? selectedSetting.title : 'Settings'}
          </Typography>
          <Typography variant="body1" sx={{ mt: -1 }}>
            {selectedSetting ? selectedSetting.description : 'Manage your app settings and preferences.'}
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
                {setting.icon}
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
          <DialogContent>
            {selectedSetting.form}
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default SettingsPage;
