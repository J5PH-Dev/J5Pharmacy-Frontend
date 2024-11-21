import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider } from './modules/auth/contexts/AuthContext';
import LoginPage from './modules/auth/components/LoginPage';
import ForgotPassword from './modules/auth/components/ForgotPassword/ForgotPassword';
import { DashboardLayout } from './layouts/DashboardLayout/DashboardLayout';
import Dashboard from './modules/dashboard/components/Dashboard';
import POSPage from './modules/pos/pages/POSPage';
import { UserRole } from './modules/auth/types/auth.types';
import { useAuth } from './modules/auth/contexts/AuthContext';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    switch (user.role) {
      case UserRole.PHARMACIST:
        return <Navigate to="/pos" />;
      default:
        return <Navigate to="/dashboard" />;
    }
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* POS Route - Accessible by Manager and Pharmacist */}
      <Route
        path="/pos"
        element={
          <ProtectedRoute allowedRoles={[UserRole.MANAGER, UserRole.PHARMACIST]}>
            <POSPage />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard" />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

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
