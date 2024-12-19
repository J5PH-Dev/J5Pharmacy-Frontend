import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button } from '@mui/material';
import Footer from '../Footer';
import logo from '../../assets/icon.png';
import CloseIcon from '@mui/icons-material/Close';
import { forgotPassword } from '../../services/authService';

const ForgotPassword: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    employeeId: '',
    email: '',
  });
  const navigate = useNavigate();

  const validateFields = () => {
    const errors = {
      employeeId: '',
      email: '',
    };
    let isValid = true;

    if (!employeeId) {
      errors.employeeId = 'Employee ID is required';
      isValid = false;
    } else if (!/^\d+$/.test(employeeId)) {
      errors.employeeId = 'Employee ID must contain only numbers';
      isValid = false;
    }

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
    setSuccess(null);

    if (!validateFields()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await forgotPassword(employeeId, email);
      setSuccess(response.message);
      // Optionally navigate to verification page after short delay
      setTimeout(() => {
        navigate('/email-verification-code', { 
          state: { 
            employeeId,
            email 
          }
        });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to process request. Please try again.');
      if (err.message.includes('employee')) {
        setFieldErrors(prev => ({ ...prev, employeeId: 'Employee ID not found' }));
      }
      if (err.message.includes('email')) {
        setFieldErrors(prev => ({ ...prev, email: 'Email not found' }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFCFC]">
      <div className="flex flex-1 mt-[-50px] flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="mt-3 pb-14 px-4 py-2 flex justify-between items-center w-full max-w-[1345px]">
          <div className="w-[43px] h-[60.52px]">
            <img src={logo} alt="J5 Pharmacy Logo" className="w-full h-full object-contain" />
          </div>
          <button
            className="border-0 bg-transparent cursor-pointer"
            onClick={() => navigate('/login')}
          >
            <CloseIcon className="text-[32px] text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-800">Reset Password</h1>
        <p className="text-gray-600 mt-2 text-center">
          Enter your Employee ID and email to reset your password
        </p>

        {error && (
          <div className="w-full max-w-md mt-5 px-4 py-2 bg-red-100 text-red-600 rounded-md border border-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="w-full max-w-md mt-5 px-4 py-2 bg-green-100 text-green-600 rounded-md border border-green-300">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 w-full max-w-md flex flex-col gap-4">
          <TextField
            id="employeeId"
            label="Employee ID"
            type="number"
            value={employeeId}
            onChange={(e) => {
              setEmployeeId(e.target.value);
              setFieldErrors((prev) => ({ ...prev, employeeId: '' }));
              setError(null);
            }}
            fullWidth
            variant="outlined"
            error={!!fieldErrors.employeeId}
            helperText={fieldErrors.employeeId}
            disabled={isLoading}
          />

          <TextField
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((prev) => ({ ...prev, email: '' }));
              setError(null);
            }}
            fullWidth
            variant="outlined"
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
            disabled={isLoading}
          />

          <button
            type="submit"
            className={`w-full mt-1 py-3 bg-[#2563eb] text-white rounded-lg font-semibold 
              ${!isLoading ? 'hover:bg-[#1d4ed8] active:bg-[#1e40af]' : 'opacity-70 cursor-not-allowed'} 
              transition-colors mb-1`}
            disabled={isLoading}
          >
            {isLoading ? 'Sending Reset Instructions...' : 'Reset Password'}
          </button>
        </form>

        <div className="text-center mt-2">
          <button
            onClick={() => navigate('/login')}
            type="button"
            className="w-full text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isLoading}
          >
            Back to Login
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
