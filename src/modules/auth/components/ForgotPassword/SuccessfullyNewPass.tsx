import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from '../Footer';
import logoJ5Pharmacy from '../../assets/icon.png';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const SuccessfullyNewPass = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect to login if accessed directly
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/login");
        }, 5000); // Auto redirect after 5 seconds

        return () => clearTimeout(timer);
    }, [navigate]);

    const handleLoginButton = () => {
        navigate("/login");
    };

    return (
        <div className="bg-[#FCFCFC] flex flex-col min-h-screen">
            <div className="flex flex-col justify-center items-center my-auto px-4 sm:px-6 lg:px-8">
                {/* Success Icon */}
                <div className="mb-6">
                    <CheckCircleIcon sx={{ fontSize: 64, color: '#22c55e' }} />
                </div>

                {/* Logo */}
                <div className="relative mb-4">
                    <img
                        src={logoJ5Pharmacy}
                        alt="Logo"
                        className="w-[60px] h-[60px] object-contain"
                    />
                </div>

                {/* Heading */}
                <h1 className="text-3xl font-bold text-gray-800">Password Reset Successful!</h1>
                <p className="text-base text-center text-gray-600 mt-1 mb-6 max-w-[325px]">
                    Your password has been successfully reset. You can now log in with your new password.
                </p>

                {/* Auto-redirect message */}
                <p className="text-sm text-gray-500 mb-4">
                    You will be redirected to the login page in a few seconds...
                </p>

                {/* Continue Button */}
                <button
                    type="button"
                    className="mt-3 px-6 py-3 bg-[#2563eb] text-white rounded-lg font-semibold 
                        hover:bg-[#1d4ed8] active:bg-[#1e40af] transition-colors w-[373px] max-w-full"
                    onClick={handleLoginButton}
                >
                    Login Now
                </button>
            </div>
            <Footer />
        </div>
    );
};

export default SuccessfullyNewPass;
