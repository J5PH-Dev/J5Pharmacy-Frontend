import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Button, Divider, Dialog, DialogTitle, DialogContent, TextField, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { AccountCircle, Info, Code, CloudUpload } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../../auth/contexts/AuthContext';

interface Setting {
  icon: JSX.Element;
  title: string;
  description: string;
  form?: JSX.Element;
}

const SettingsPage = () => {
  const [selectedSetting, setSelectedSetting] = useState<Setting | null>(null);
  const { user } = useAuth();
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  // Form states
  const [employeeId, setEmployeeId] = useState(userData.employeeId || '');
  const [name, setName] = useState(userData.name || '');
  const [role, setRole] = useState(userData.role || '');
  const [branch, setBranch] = useState(userData.branchId || '');
  const [email, setEmail] = useState(userData.email || '');
  const [phone, setPhone] = useState(userData.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remarks, setRemarks] = useState(userData.remarks || '');
  const [hiredDate, setHiredDate] = useState(userData.hired_at || '');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [branches, setBranches] = useState<any[]>([]);

  // Validation states
  const [emailError, setEmailError] = useState(false);
  const [emailHelperText, setEmailHelperText] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordHelperText, setPasswordHelperText] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  const [phoneHelperText, setPhoneHelperText] = useState('');

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchBranches();
    setEmail(userData.email || '');
    setPhone(userData.phone || '');
    setEmployeeId(userData.employeeId || '');
    setName(userData.name || '');
    setRole(userData.role || '');
    setBranch(userData.branchId || '');
    setRemarks(userData.remarks || '');
    setHiredDate(userData.hired_at || '');
  }, [userData]);

  const fetchBranches = async () => {
    try {
      const response = await axios.get('/api/staff/branches');
      setBranches(response.data.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(newEmail)) {
      setEmailError(true);
      setEmailHelperText('Please enter a valid email address');
    } else {
      setEmailError(false);
      setEmailHelperText('');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value;
    setPhone(newPhone);

    const phonePattern = /^(\+63|0)[0-9]{10}$/;
    if (!phonePattern.test(newPhone)) {
      setPhoneError(true);
      setPhoneHelperText('Please enter a valid phone number (e.g., +639123456789 or 09123456789)');
    } else {
      setPhoneError(false);
      setPhoneHelperText('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    validatePasswords(e.target.value, confirmPassword);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    validatePasswords(newPassword, e.target.value);
  };

  const validatePasswords = (pass: string, confirm: string) => {
    if (pass && confirm && pass !== confirm) {
      setPasswordError(true);
      setPasswordHelperText('Passwords do not match');
    } else {
      setPasswordError(false);
      setPasswordHelperText('');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setSnackbar({
          open: true,
          message: 'Image size should not exceed 5MB',
          severity: 'error'
        });
        return;
      }
      if (!file.type.match(/image\/(jpeg|jpg|png)/i)) {
        setSnackbar({
          open: true,
          message: 'Only JPEG and PNG images are allowed',
          severity: 'error'
        });
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      if (emailError || phoneError || passwordError) {
        setSnackbar({ open: true, message: 'Please fix the validation errors', severity: 'error' });
        return;
      }

      const formData = new FormData();
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('remarks', remarks);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      if (newPassword && currentPassword) {
        formData.append('current_password', currentPassword);
        formData.append('new_password', newPassword);
      }

      const response = await axios.put(`/api/staff/users/${userData.user_id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Update local storage with new data
        const updatedUserData = { 
          ...userData, 
          email, 
          phone,
          remarks,
          image_data: response.data.user.image_data,
          image_type: response.data.user.image_type
        };
        localStorage.setItem('user', JSON.stringify(updatedUserData));

        setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSelectedImage(null);
      }
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error updating profile', 
        severity: 'error' 
      });
    }
  };

  // Settings data with icons and details
  const settingsData = [
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
            <Typography variant="body1">PMS: Beta 1.1.0</Typography>
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
            Manage your app settings and preferences. (Soon!)
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
                cursor: 'pointer'
              })}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSetting(setting);
              }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSetting(setting);
                }}
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
        <Dialog 
          open={Boolean(selectedSetting)} 
          onClose={() => setSelectedSetting(null)} 
          fullWidth 
          maxWidth="md"
          sx={{
            '& .MuiDialog-paper': {
              overflow: 'visible'
            }
          }}
        >
          <DialogTitle>{selectedSetting.title}</DialogTitle>
          <DialogContent>
            <Box onClick={(e) => e.stopPropagation()}>
              {selectedSetting.form}
            </Box>
          </DialogContent>
        </Dialog>
      )}

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;