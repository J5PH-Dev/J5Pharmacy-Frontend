import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider, useAuth } from './modules/auth/contexts/AuthContext';
import LoginPage from './modules/auth/components/LoginPage';
import CreateNewPassword from './modules/auth/components/ForgotPassword/CreateNewPassword';
import CreatedNewPassword from './modules/auth/components/ForgotPassword/SuccessfullyNewPass';
import ForgotPassword from './modules/auth/components/ForgotPassword/ForgotPassword';
import EmailVerification from './modules/auth/components/ForgotPassword/EmailCodeVerification';
import POSPage from './modules/pos/pages/POSPage';
import NotFoundPage from './modules/auth/components/NotfoundPage';
import AdminRoutes from './modules/adminDashboard/AdminRoutes';
import ManagerRoutes from './modules/managerDashboard/ManagerRoutes';
import LoadingPage from './modules/auth/components/LoadingPage';
import { UserRole } from './modules/auth/types/auth.types';

// Import Axios and configure it
import axios from 'axios';

// Set Axios defaults
axios.defaults.baseURL = "http://localhost:5000";  // Adjust the URL according to your backend
axios.defaults.withCredentials = true;  // Allow cookies to be sent with requests

// ProtectedRoute component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on user role if unauthorized
    switch (user.role) {
      case UserRole.PHARMACIST:
        return <Navigate to="/pos" />;
      case UserRole.ADMIN:
        return <Navigate to="/admin/dashboard" />;
      case UserRole.MANAGER:
        return <Navigate to="/manager/dashboard" />;
      default:
        return <Navigate to="/admin/dashboard" />;
    }
  }

  // Render children if authorized
  return <>{children}</>;
};

// AppRoutes component
const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/email-verification-code" element={<EmailVerification />} />
      <Route path="/create-new-password" element={<CreateNewPassword />} />
      <Route path="/created-new-password" element={<CreatedNewPassword />} />
      <Route path="/loading-screen" element={<LoadingPage />} />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AdminRoutes />
          </ProtectedRoute>
        }
      />

      {/* POS Routes */}
      <Route
        path="/pos"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PHARMACIST]}>
            <POSPage />
          </ProtectedRoute>
        }
      />
      
      {/* Manager Routes */}
      <Route
        path="/manager/*"
        element={
          <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
            <ManagerRoutes />
          </ProtectedRoute>
        }
      />

      {/* Redirect root to appropriate dashboard based on role */}
      <Route
        path="/"
        element={
          user ? (
            user.role === UserRole.ADMIN ? (
              <Navigate to="/admin/dashboard" replace />
            ) : user.role === UserRole.MANAGER ? (
              <Navigate to="/manager/dashboard" replace />
            ) : user.role === UserRole.PHARMACIST ? (
              <Navigate to="/pos" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch-all route for undefined paths */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// App component
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
