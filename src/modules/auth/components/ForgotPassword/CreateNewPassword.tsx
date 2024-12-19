import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from '../Footer';
import logoJ5Pharmacy from '../../assets/icon.png';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { resetPassword } from '../../services/authService';

const SetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    
    // State for form data
    const [formData, setFormData] = useState({
        employeeId: '',
        token: '',
        password: '',
        confirmPassword: ''
    });
    
    // State for password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // State for errors
    const [error, setError] = useState({
        password: '',
        confirmPassword: '',
        general: ''
    });

    // Get data from navigation state
    useEffect(() => {
        if (location.state?.employeeId && location.state?.token) {
            setFormData(prev => ({
                ...prev,
                employeeId: location.state.employeeId,
                token: location.state.token
            }));
        } else {
            // If no state is present, redirect to forgot password
            navigate('/forgot-password');
        }
    }, [location, navigate]);

    // Password validation
    const validatePassword = (password: string) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/[a-z]/.test(password)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/[0-9]/.test(password)) {
            return 'Password must contain at least one number';
        }
        if (!/[!@#$%^&*]/.test(password)) {
            return 'Password must contain at least one special character (!@#$%^&*)';
        }
        return '';
    };

    // Handle password change
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setFormData(prev => ({ ...prev, password: newPassword }));
        
        // Validate password
        const passwordError = validatePassword(newPassword);
        setError(prev => ({ ...prev, password: passwordError }));
        
        // Check if confirm password matches
        if (formData.confirmPassword && newPassword !== formData.confirmPassword) {
            setError(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
        } else {
            setError(prev => ({ ...prev, confirmPassword: '' }));
        }
    };

    // Handle confirm password change
    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const confirmPass = e.target.value;
        setFormData(prev => ({ ...prev, confirmPassword: confirmPass }));
        
        if (confirmPass !== formData.password) {
            setError(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
        } else {
            setError(prev => ({ ...prev, confirmPassword: '' }));
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            setError({ password: '', confirmPassword: '', general: '' });

            // Validate password
            const passwordError = validatePassword(formData.password);
            if (passwordError) {
                setError(prev => ({ ...prev, password: passwordError }));
                return;
            }

            // Check if passwords match
            if (formData.password !== formData.confirmPassword) {
                setError(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
                return;
            }

            // Call reset password API
            await resetPassword(
                formData.employeeId,
                formData.token,
                formData.password
            );

            // Navigate to success page
            navigate("/created-new-password");
        } catch (error: any) {
            setError(prev => ({
                ...prev,
                general: error.message || 'Failed to reset password. Please try again.'
            }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="font-sans min-h-screen flex flex-col bg-[#FCFCFC]">
            <div className="flex flex-col mt-[-14px] items-center justify-center py-8 px-4 sm:px-6 lg:px-8 flex-1">
                <div className="mt-[-67px] mb-12 w-full max-w-[1345px] flex justify-between items-center px-4">
                    <div className="w-[43px] h-[60.52px]">
                        <img src={logoJ5Pharmacy} alt="J5 Pharmacy Logo" className="w-full h-full object-contain" />
                    </div>
                    <button
                        className="border-0 bg-transparent cursor-pointer"
                        onClick={() => navigate('/login')}
                    >
                        <CloseIcon className="text-[32px] text-gray-500 hover:text-gray-700" />
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <div className="text-center max-w-md mx-auto">
                        <h2 className="text-3xl font-bold text-gray-800">Create New Password</h2>
                        <p className="text-gray-600 mb-5 mt-1 text-center">
                            Your new password must be different from previously used passwords
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    {error.general && (
                        <div className="w-full mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                            {error.general}
                        </div>
                    )}

                    <TextField
                        sx={{ marginBottom: 2 }}
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handlePasswordChange}
                        fullWidth
                        variant="outlined"
                        error={!!error.password}
                        helperText={error.password}
                        disabled={isLoading}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        sx={{ marginBottom: 2 }}
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        fullWidth
                        variant="outlined"
                        error={!!error.confirmPassword}
                        helperText={error.confirmPassword}
                        disabled={isLoading}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        edge="end"
                                        disabled={isLoading}
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <button
                        type="submit"
                        className={`w-full mt-2 py-3 bg-[#2563eb] text-white rounded-lg font-semibold 
                            ${!isLoading ? 'hover:bg-[#1d4ed8] active:bg-[#1e40af]' : 'opacity-70 cursor-not-allowed'} 
                            transition-colors mb-3`}
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SetPassword;
