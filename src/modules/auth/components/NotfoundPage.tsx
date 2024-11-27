import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from './Footer';
import BgNotFound from './ForgotPassword/bgNotFound.png';
import logoJ5Pharmacy from '../assets/icon.png';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    if (!user) {
      navigate('/login');
    } else {
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'PHARMACIST':
          navigate('/pos');
          break;
        default:
          navigate('/login'); // Fallback for any undefined role
      }
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-[#FCFCFC] bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${BgNotFound})`,
      }}
    >
      <div className="my-auto text-center">
        <div className="relative w-[50px] h-[50px] mx-auto mb-4">
          <img
            src={logoJ5Pharmacy}
            alt="Logo"
            className="w-full h-full object-contain absolute top-0 left-0"
          />
        </div>
        <h2 className="text-2xl font-bold text-[#1D242E]">404</h2>
        <h1 className="text-4xl font-bold text-[#1D242E] mt-[-4px]">
          Oops, page not found
        </h1>
        <p className="mx-auto mt-3 text-gray-600 text-sm leading-6 max-w-[445px]">
          The page you're looking for doesn't exist or has been moved. Please
          check the URL or return to the homepage.
        </p>
        <button
          type="button"
          className="mt-9 px-6 py-3 bg-[#2563eb] text-white rounded-lg font-semibold hover:bg-[#1d4ed8] active:bg-[#1e40af] transition-colors w-[182px] max-w-full"
          onClick={handleGoBack}
        >
          Go Back
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
