import logoJ5Pharmacy from '../../assets/icon.png';
import Footer from "../Footer";
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { verifyResetToken } from '../../services/authService';

const EmailCodeVerify = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [employeeId, setEmployeeId] = useState('');
    const [email, setEmail] = useState('');

    // Get employee_id and email from navigation state
    useEffect(() => {
        if (location.state?.employeeId && location.state?.email) {
            setEmployeeId(location.state.employeeId);
            setEmail(location.state.email);
        } else {
            // If no state is present, redirect to forgot password
            navigate('/forgot-password');
        }
    }, [location, navigate]);

    // State to store the code inputs
    const [inputs, setInputs] = useState(["", "", "", "", "", ""]);
    const [errors, setErrors] = useState(Array(6).fill(false));
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmitButton = async () => {
        setIsLoading(true);
        setErrorMessage("");
        setErrors(Array(6).fill(false));

        const token = inputs.join("");
        
        if (token.length !== 6) {
            setErrorMessage("Please enter all 6 digits of the code.");
            setErrors(Array(6).fill(true));
            setIsLoading(false);
            return;
        }

        try {
            await verifyResetToken(employeeId, token);
            // If verification is successful, navigate to create new password
            navigate('/create-new-password', {
                state: {
                    employeeId,
                    token,
                    email
                }
            });
        } catch (error) {
            setErrors(Array(6).fill(true));
            setErrorMessage(error.message || "Invalid verification code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackClick = () => {
        navigate("/forgot-password");
    };

    const handleInputChange = (e, index) => {
        const value = e.target.value;
        // Only allow numbers
        if (/[^0-9]/.test(value)) {
            return;
        }

        const newInputs = [...inputs];
        newInputs[index] = value;
        setInputs(newInputs);

        // Clear error state when typing
        setErrors(Array(6).fill(false));
        setErrorMessage("");

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`input-${index + 1}`).focus();
        }
    };

    // Handle paste event
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
        const newInputs = [...inputs];
        
        for (let i = 0; i < pastedData.length; i++) {
            if (i < 6) {
                newInputs[i] = pastedData[i];
            }
        }
        
        setInputs(newInputs);
        setErrors(Array(6).fill(false));
        setErrorMessage("");
    };

    const handleResendCode = async () => {
        try {
            setIsLoading(true);
            // Reset the form
            setInputs(Array(6).fill(""));
            setErrors(Array(6).fill(false));
            setErrorMessage("");
            
            // Navigate back to forgot-password with the same credentials
            navigate('/forgot-password', { 
                state: { 
                    employeeId,
                    email,
                    resend: true 
                }
            });
        } catch (error) {
            setErrorMessage("Failed to resend code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="font-sans min-h-screen flex flex-col bg-[#FCFCFC]">
            <div className='flex flex-1 mt-[-14px] flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8'>
                <div className="mt-44 px-4 flex justify-between items-center w-full max-w-[1345px]">
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

                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center mt-[-125px] max-w-md mx-auto">
                        <h2 className="text-3xl font-bold text-gray-800">Email Verification</h2>
                        <p className="text-gray-600 mt-2 text-center">
                            We have sent a code to your email <b>{email}</b>
                        </p>

                        <div className="mt-6 flex flex-col items-center">
                            <div className="flex gap-4">
                                {inputs.map((value, index) => (
                                    <input
                                        key={index}
                                        id={`input-${index}`}
                                        type="text"
                                        value={value}
                                        onChange={(e) => handleInputChange(e, index)}
                                        onPaste={handlePaste}
                                        maxLength={1}
                                        disabled={isLoading}
                                        className={`w-[40px] max-w-full text-center text-2xl font-semibold rounded-xl h-[45px] 
                                            ${errors[index] ? 'border border-1 border-red-500' : 'border-2 border-[#D0D0D0]'}
                                            ${isLoading ? 'bg-gray-100' : ''}`}
                                    />
                                ))}
                            </div>

                            {errorMessage && (
                                <p className="mt-2 text-red-500 text-sm">{errorMessage}</p>
                            )}

                            <button
                                className={`mt-8 w-full py-3 bg-[#2563eb] max-w-[420px] text-lg text-white rounded-lg font-semibold 
                                    ${!isLoading ? 'hover:bg-[#1d4ed8] active:bg-[#1e40af]' : 'opacity-70 cursor-not-allowed'} 
                                    transition-colors`}
                                onClick={handleSubmitButton}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Verifying...' : 'Submit'}
                            </button>

                            <button
                                className="mt-3 w-full max-w-[420px] py-3 text-lg font-semibold bg-[#6c6c6c] opacity-75 text-white rounded-lg hover:bg-[#4b4b4b] transition-colors"
                                onClick={handleBackClick}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>

                            <p className="mt-4 text-sm text-gray-600 max-w-[420px] mx-auto">
                                Didn't get a code?{' '}
                                <button
                                    className={`text-gray-800 hover:text-gray-900 font-semibold underline cursor-pointer
                                        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={handleResendCode}
                                    disabled={isLoading}
                                >
                                    Click to resend
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default EmailCodeVerify;
