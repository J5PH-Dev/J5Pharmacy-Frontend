import logoJ5Pharmacy from '../../assets/icon.png';
import Footer from "../Footer";
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useState } from 'react';

const EmailCodeVerify = () => {
    const navigate = useNavigate();

    // State to store the code inputs
    const [inputs, setInputs] = useState(["", "", "", ""]);
    const [errors, setErrors] = useState([false, false, false, false]);
    const [errorMessage, setErrorMessage] = useState(""); // For the error message

    const handleSubmitButton = () => {
        // Check if the inputs match the mock PIN ("1234")
        const mockPin = "1234";
        const enteredPin = inputs.join("");

        // If the code doesn't match, set errors and error message
        if (enteredPin !== mockPin) {
            setErrors([true, true, true, true]); // Show red borders on all inputs
            setErrorMessage("The code you entered is incorrect. Please try again.");
        } else {
            setErrors([false, false, false, false]); // Clear errors if the PIN is correct
            setErrorMessage(""); // Clear error message
            navigate("/create-new-password"); // Proceed to the next page
        }
    };

    const handleBackClick = () => {
        navigate("/forgot-password"); // Navigate to Forgot Password page
    };

    const handleExitClick = () => {
        navigate("/login"); // Navigate to the Home page
    };

    const handleInputChange = (e, index) => {
        const newInputs = [...inputs];
        newInputs[index] = e.target.value;

        // Only allow numbers and restrict to length of 1
        if (/[^0-9]/.test(e.target.value)) {
            return; // Do not update if not a number
        }

        setInputs(newInputs);

        // Focus the next input if value is entered
        if (e.target.value && index < 3) {
            document.getElementById(`input-${index + 1}`).focus();
        }
    };

    // Function to handle resend code
    const handleResendCode = () => {
        // Commented out backend call
        // fetch('/api/resend-code', { method: 'POST' })
        //     .then(response => response.json())
        //     .then(data => {
        //         // Handle the response (e.g., show a success message)
        //     })
        //     .catch(error => {
        //         // Handle any error
        //         console.error('Error resending code:', error);
        //     });

        // Reload the page
        window.location.reload();
        navigate('/email-verification-code'); // Reload the same page to simulate resend
    };

    return (
        <div className="font-sans min-h-screen flex flex-col bg-[#FCFCFC]">
            {/* Header with Logo and Exit Button */}
            <div className='flex flex-1 mt-[-14px] flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8'>
                <div className="mt-44 px-4 flex justify-between items-center w-full max-w-[1345px]">
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
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center mt-[-125px] max-w-md mx-auto">
                        {/* Title */}
                        <h2 className="text-3xl font-bold text-gray-800">Email Verification</h2>
                        <p className="text-gray-600 mt-2 text-center">
                            We have sent a code to your email <b> jdoecath@pharmacy.com</b>
                        </p>

                        {/* Form */}
                        <div className="mt-6 flex flex-col items-center">
                            <div className="flex gap-8">
                                {[...Array(4)].map((_, index) => (
                                    <input
                                        key={index}
                                        id={`input-${index}`}
                                        type="text"
                                        value={inputs[index]}
                                        onChange={(e) => handleInputChange(e, index)}
                                        maxLength={1}
                                        className={`w-[48.39px] max-w-full text-center text-2xl font-semibold rounded-xl h-[54.06px] 
                                            ${errors[index] ? 'border border-1 border-red-500' : 'border-2 border-[#D0D0D0]'} `}
                                    />
                                ))}
                            </div>

                            {/* Error Message */}
                            {errorMessage && (
                                <p className="mt-2 text-red-500 text-sm">{errorMessage}</p>
                            )}

                            {/* Submit Button */}
                            <button
                                className="mt-8 w-full py-3 bg-[#2563eb] max-w-[420px] text-lg text-white rounded-lg font-semibold hover:bg-[#1d4ed8] active:bg-[#1e40af] transition-colors"
                                onClick={handleSubmitButton}
                            >
                                Submit
                            </button>

                            {/* Cancel Button */}
                            <button
                                className="mt-3 w-full max-w-[420px] py-3 text-lg font-semibold bg-[#6c6c6c] opacity-75 text-white rounded-lg hover:bg-[#4b4b4b] transition-colors"
                                onClick={handleBackClick}
                            >
                                Cancel
                            </button>

                            {/* Resend Code */}
                            <p className="mt-4 text-sm text-gray-600 max-w-[420px] mx-auto">
                                Didn’t get a code?{' '}
                                <button
                                    className="text-gray-800 hover:text-gray-900 font-semibold underline cursor-pointer"
                                    onClick={handleResendCode} // Call the resend function
                                >
                                    Click to resend
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default EmailCodeVerify;
