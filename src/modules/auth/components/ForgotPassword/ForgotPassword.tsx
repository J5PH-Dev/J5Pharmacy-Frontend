import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Link,
  alpha,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/icon.png';

const ForgotPassword: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    employeeId: '',
    email: '',
  });
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const validateFields = () => {
    const errors = {
      employeeId: '',
      email: '',
    };
    let isValid = true;

    // Employee ID validation
    if (!employeeId) {
      errors.employeeId = 'Employee ID is required';
      isValid = false;
    } else if (!/^\d+$/.test(employeeId)) {
      errors.employeeId = 'Employee ID must contain only numbers';
      isValid = false;
    }

    // Email validation
    if (!email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess('');
    
    if (!validateFields()) {
      return;
    }

    try {
      // TODO: Implement actual password reset logic here
      // For now, simulate an API call with validation
      if (employeeId === '12345') {  // Example validation
        setSuccess('Password reset instructions have been sent to your email.');
        // Clear fields after success
        setEmployeeId('');
        setEmail('');
        setFieldErrors({ employeeId: '', email: '' });
        
        // Automatically redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError('Employee ID not found in our system.');
      }
    } catch (err) {
      setError('Unable to process your request. Please try again later.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8fafc',
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="J5 Pharmacy Logo"
          sx={{
            width: 55,
            height: 75,
            mb: 3,
          }}
        />

        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{
            color: '#1e293b',
            fontWeight: 600,
          }}
        >
          Reset Password
        </Typography>

        <Typography
          variant="subtitle1"
          align="center"
          gutterBottom
          sx={{ 
            mb: 4,
            color: '#475569',
          }}
        >
          Enter your Employee ID and email to reset your password
        </Typography>

        {error && (
          <Typography 
            sx={{ 
              mb: 2,
              bgcolor: alpha('#ef4444', 0.1),
              color: '#dc2626',
              py: 1,
              px: 2,
              borderRadius: 1,
              width: '100%',
              textAlign: 'center',
            }}
          >
            {error}
          </Typography>
        )}

        {success && (
          <Typography 
            sx={{ 
              mb: 2,
              bgcolor: alpha('#22c55e', 0.1),
              color: '#16a34a',
              py: 1,
              px: 2,
              borderRadius: 1,
              width: '100%',
              textAlign: 'center',
            }}
          >
            {success}
          </Typography>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            id="employeeId"
            label="Employee ID"
            value={employeeId}
            onChange={(e) => {
              setEmployeeId(e.target.value);
              setFieldErrors(prev => ({ ...prev, employeeId: '' }));
              setError(null);
            }}
            autoComplete="username"
            error={!!fieldErrors.employeeId}
            helperText={fieldErrors.employeeId}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#64748b',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2563eb',
                },
                bgcolor: 'white',
              },
              '& .MuiInputLabel-root': {
                color: '#64748b',
                '&.Mui-focused': {
                  color: '#2563eb',
                },
              },
            }}
          />

          <TextField
            fullWidth
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors(prev => ({ ...prev, email: '' }));
              setError(null);
            }}
            autoComplete="email"
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#64748b',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2563eb',
                },
                bgcolor: 'white',
              },
              '& .MuiInputLabel-root': {
                color: '#64748b',
                '&.Mui-focused': {
                  color: '#2563eb',
                },
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{
              mt: 2,
              bgcolor: '#2563eb',
              color: 'white',
              textTransform: 'none',
              fontSize: '1rem',
              py: 1.5,
              '&:hover': {
                bgcolor: '#1d4ed8',
              },
              '&:active': {
                bgcolor: '#1e40af',
              },
            }}
          >
            Reset Password
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
              underline="hover"
              sx={{
                color: '#2563eb',
                '&:hover': {
                  color: '#1d4ed8',
                },
                cursor: 'pointer',
              }}
            >
              Back to Login
            </Link>
          </Box>
        </Box>
      </Container>

      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: 'center',
          borderTop: 1,
          borderColor: '#e2e8f0',
          bgcolor: '#1e293b',
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#f8fafc',
          }}
        >
          J'5 Pharmacy Management System 2024
        </Typography>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
