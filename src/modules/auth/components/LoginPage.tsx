import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import logoJ5Pharmacy from '../assets/icon.png';
import { TextField, InputAdornment, IconButton, Tab, Tabs } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import * as authService from '../services/authService';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState(0); // 0 for PMS, 1 for POS
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({ employeeId: '', password: '', pin: '', general: '' });
  
  const navigate = useNavigate();
  const { pmsLogin, posLogin } = useAuth();

  // Clear any existing auth data when login page loads
  useEffect(() => {
    console.log('Clearing existing auth data');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authService.removeAuthToken();
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlePMSLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({ employeeId: '', password: '', pin: '', general: '' });

    let valid = true;
    if (!employeeId) {
      setError(prev => ({ ...prev, employeeId: 'Employee ID is required' }));
      valid = false;
    }
    if (!password) {
      setError(prev => ({ ...prev, password: 'Password is required' }));
      valid = false;
    }

    if (!valid) return;

    try {
      await pmsLogin(employeeId, password);
    } catch (err) {
      setError(prev => ({ ...prev, general: 'Invalid credentials' }));
    }
  };

  const handlePOSLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({ employeeId: '', password: '', pin: '', general: '' });

    if (!pinCode) {
      setError(prev => ({ ...prev, pin: 'PIN code is required' }));
      return;
    }

    try {
      await posLogin(pinCode);
    } catch (err) {
      setError(prev => ({ ...prev, general: 'Invalid PIN code' }));
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="bg-[#FCFCFC] flex flex-col min-h-screen">
      <div className="flex flex-col justify-center items-center my-auto px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="relative mb-6">
          <img
            src={logoJ5Pharmacy}
            alt="Logo"
            className="w-[80px] h-[80px] object-contain"
          />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-800">Sign In</h1>
        <p className="text-base text-gray-600 mt-1 mb-6">
          Access your account to manage the system
        </p>

        {/* Login Type Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          className="mb-4"
        >
          <Tab label="PMS Login" />
          <Tab label="POS Login" />
        </Tabs>

        {/* Error Message Box */}
        {error.general && (
          <div className="w-full max-w-sm mb-4 px-4 py-2 bg-red-100 text-red-600 rounded-md border border-red-300">
            {error.general}
          </div>
        )}

        {/* Form */}
        <div className="w-full max-w-sm">
          {activeTab === 0 ? (
            // PMS Login Form
            <form onSubmit={handlePMSLogin}>
              <TextField
                sx={{ marginBottom: 2 }}
                fullWidth
                id="employeeId"
                label="Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                autoComplete="username"
                error={!!error.employeeId}
                type="number"
                inputProps={{
                  pattern: '[0-9]*',
                  inputMode: 'numeric',
                }}
                variant="outlined"
                helperText={error.employeeId}
              />

              <TextField
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                variant="outlined"
                className="mb-3"
                autoComplete="current-password"
                error={!!error.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText={error.password}
              />

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-[#2563eb] text-white rounded-lg font-semibold hover:bg-[#1d4ed8] active:bg-[#1e40af] transition-colors mb-3"
              >
                Continue
              </button>

              <button
                type="button"
                className="w-full text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>
            </form>
          ) : (
            // POS Login Form
            <form onSubmit={handlePOSLogin}>
              <TextField
                sx={{ marginBottom: 2 }}
                fullWidth
                id="pinCode"
                label="PIN Code"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                error={!!error.pin}
                type="password"
                inputProps={{
                  maxLength: 4,
                  pattern: '[0-9]*',
                  inputMode: 'numeric',
                }}
                variant="outlined"
                helperText={error.pin}
              />

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-[#2563eb] text-white rounded-lg font-semibold hover:bg-[#1d4ed8] active:bg-[#1e40af] transition-colors mb-3"
              >
                Access POS
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LoginPage;
