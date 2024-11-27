import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer';
import logoJ5Pharmacy from '../../assets/icon.png';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Visibility, VisibilityOff } from '@mui/icons-material'; // Importing icons
import { useAuth } from '../../contexts/AuthContext'; // Import your AuthContext

const SetPassword = () => {
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Separate state for confirm password
    const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle for confirm password visibility
    const [error, setError] = useState({ employeeId: '', password: '', confirmPassword: '', general: '' });
    const navigate = useNavigate(); // Initialize the navigate hook
    const { login } = useAuth(); // Assuming login function comes from AuthContext

    // Toggle Password Visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Toggle Confirm Password Visibility
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    // Handle Submit button click
    const handleSubmit = () => {
        // Clear previous errors
        setError({ employeeId: '', password: '', confirmPassword: '', general: '' });

        let isValid = true;

        // Validate password
        if (!password) {
            setError((prevState) => ({ ...prevState, password: 'Password is required' }));
            isValid = false;
        }

        // Validate confirm password
        if (!confirmPassword) {
            setError((prevState) => ({ ...prevState, confirmPassword: 'Confirm Password is required' }));
            isValid = false;
        }

        // Check if passwords match
        if (password && confirmPassword && password !== confirmPassword) {
            setError((prevState) => ({ ...prevState, confirmPassword: 'Passwords do not match' }));
            isValid = false;
        }

        if (isValid) {
            // If form is valid, navigate to login page
            navigate("/created-new-password");
        } else {
            // Set a general error if validation fails
            setError((prevState) => ({ ...prevState, general: 'Please fix the errors above' }));
        }
    };

    return (
        <div className="font-sans min-h-screen flex flex-col bg-[#FCFCFC]">
            {/* Header with Logo and Exit Button */}
            <div className="flex flex-col mt-[-14px] items-center justify-center py-8 px-4 sm:px-6 lg:px-8 flex-1">
                <div className="mt-[-67px] mb-12 w-full max-w-[1345px] flex justify-between items-center px-4">
                    <div className="w-[43px] h-[60.52px]">
                        <img src={logoJ5Pharmacy} alt="J5 Pharmacy Logo" className="w-full h-full object-contain" />
                    </div>
                    <button
                        className="border-0 bg-transparent cursor-pointer"
                        onClick={() => navigate('/login')} // Navigate to login page on click
                    >
                        <CloseIcon className="text-[32px] text-gray-500 hover:text-gray-700" />
                    </button>
                </div>

                {/* Main content */}
                <div className="flex flex-col items-center justify-center">
                    <div className="text-center max-w-md mx-auto">
                        {/* Title */}
                        <h2 className="text-3xl font-bold text-gray-800">Create New Password</h2>
                        <p className="text-gray-600 mb-5 mt-1 text-center">
                            Secure your account with a strong new password
                        </p>
                    </div>
                </div>
                {/* Form */}
                <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Password Field */}
                    <TextField
                        sx={{ marginBottom: 2 }}
                        id="password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}  // Use separate state for password
                        fullWidth
                        variant="outlined"
                        className="mb-3" // Adds margin-bottom 3 to the input field
                        autoComplete="current-password"
                        error={!!error.password || !!error.general} // Red border for empty or incorrect fields
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={togglePasswordVisibility} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        helperText={error.password} // Display error message beneath input
                    />

                    {/* Confirm Password Field */}
                    <TextField
                        sx={{ marginBottom: 2 }}
                        id="confirmPassword"
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}  // Use separate state for confirmPassword
                        onChange={(e) => setConfirmPassword(e.target.value)} // Update only confirmPassword
                        fullWidth
                        variant="outlined"
                        className="mb-3" // Adds margin-bottom 3 to the input field
                        autoComplete="current-password"
                        error={!!error.confirmPassword || !!error.general} // Red border for empty or incorrect fields
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={toggleConfirmPasswordVisibility} edge="end">
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        helperText={error.confirmPassword} // Display error message beneath input
                    />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full mt-2 py-3 bg-[#2563eb] text-white rounded-lg font-semibold hover:bg-[#1d4ed8] active:bg-[#1e40af] transition-colors mb-3"
                        onClick={handleSubmit} // Submit form when clicked
                    >
                        Submit
                    </button>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default SetPassword;
