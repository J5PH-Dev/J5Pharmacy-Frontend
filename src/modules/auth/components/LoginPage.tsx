import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  Link,
  InputAdornment,
  alpha,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/icon.png';

const LoginPage: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate employee ID is a number
    if (!/^\d+$/.test(employeeId)) {
      setError('Employee ID must be a number');
      return;
    }
    
    try {
      await login(employeeId, password);
      // Navigation is handled by AuthContext
    } catch (err) {
      setError('Invalid Employee ID or password');
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8fafc',  // Light background with slight blue tint
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
            color: '#1e293b',  // Darker text for better contrast
            fontWeight: 600,
          }}
        >
          Sign In
        </Typography>

        <Typography
          variant="subtitle1"
          color="text.secondary"
          align="center"
          gutterBottom
          sx={{ 
            mb: 4,
            color: '#475569',  // Medium contrast for subtitle
          }}
        >
          Access your account to manage the system
        </Typography>

        {error && (
          <Typography 
            color="error" 
            sx={{ 
              mb: 2,
              bgcolor: alpha('#ef4444', 0.1),  // Light red background
              color: '#dc2626',  // Darker red text
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

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            maxWidth: 400,
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
            onChange={(e) => setEmployeeId(e.target.value)}
            autoComplete="username"
            error={!!error}
            type="number"
            inputProps={{ 
              pattern: '[0-9]*',
              inputMode: 'numeric'
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#64748b',  // Darker border on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2563eb',  // Blue border when focused
                },
                bgcolor: 'white',  // White background for input
              },
              '& .MuiInputLabel-root': {
                color: '#64748b',  // Darker label color
                '&.Mui-focused': {
                  color: '#2563eb',  // Blue label when focused
                },
              },
            }}
          />

          <TextField
            fullWidth
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            error={!!error}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                    sx={{
                      color: '#64748b',
                      '&:hover': {
                        bgcolor: alpha('#64748b', 0.1),
                      },
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
              bgcolor: '#2563eb',  // Primary blue
              color: 'white',
              textTransform: 'none',
              fontSize: '1rem',
              py: 1.5,
              '&:hover': {
                bgcolor: '#1d4ed8',  // Darker blue on hover
              },
              '&:active': {
                bgcolor: '#1e40af',  // Even darker when clicked
              },
            }}
          >
            Continue
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link 
              href="/forgot-password"
              sx={{
                underline: 'hover',
                color: '#2563eb',
                '&:hover': {
                  color: '#1d4ed8',
                },
                cursor: 'pointer',
              }}
            >
              Forgot Password?
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
          bgcolor: '#1e293b',  // Dark blue-gray background
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

export default LoginPage;
