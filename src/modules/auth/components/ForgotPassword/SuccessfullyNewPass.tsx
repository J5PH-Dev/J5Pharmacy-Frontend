import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer';
import logoJ5Pharmacy from '../../assets/icon.png';


const SuccessfullyNewPass = () => {
    const navigate = useNavigate(); // Initialize the navigate hook

    const handleLoginButton = () => {
        navigate("/login");
    };

    return (
        <div className="bg-[#FCFCFC] flex flex-col min-h-screen">
            <div className="flex flex-col justify-center items-center my-auto px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <div className="relative mb-4">
                    <img
                        src={logoJ5Pharmacy}
                        alt="Logo"
                        className="w-[60px] h-[60px] object-contain"
                    />
                </div>

                {/* Heading */}
                <h1 className="text-3xl font-bold text-gray-800">Password Reset!</h1>
                <p className="text-base text-center text-gray-600 mt-1 mb-6 max-w-[325px]">Password reset successful! You can now log in with your new password.</p>


                {/* Continue Button */}
                <button
                    type="submit"
                    className="mt-3 px-6 py-3 bg-[#2563eb] text-white rounded-lg font-semibold hover:bg-[#1d4ed8] active:bg-[#1e40af] transition-colors w-[373px] max-w-full"
                    onClick={handleLoginButton}
                >
                    Continue
                </button>
            </div>
            {/* Footer */}
            <Footer />
        </div>

    );
};

export default SuccessfullyNewPass;
