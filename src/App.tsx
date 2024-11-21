import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider } from './modules/auth/contexts/AuthContext';
import LoginPage from './modules/auth/components/LoginPage';
import ForgotPassword from './modules/auth/components/ForgotPassword/ForgotPassword';
import POSPage from './modules/pos/pages/POSPage';
import { UserRole } from './modules/auth/types/auth.types';
import { useAuth } from './modules/auth/contexts/AuthContext';
import AdminRoutes from './routes/AdminRoutes';

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
      case UserRole.ADMIN:
        return <Navigate to="/admin/dashboard" />;
      default:
        return <Navigate to="/admin/dashboard" />;
    }
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <AdminRoutes />
        </ProtectedRoute>
      } />

      {/* POS Routes */}
      <Route path="/pos" element={
        <ProtectedRoute allowedRoles={[UserRole.PHARMACIST]}>
          <POSPage />
        </ProtectedRoute>
      } />

      {/* Redirect root to appropriate dashboard based on role */}
      <Route path="/" element={
        user ? (
          user.role === UserRole.ADMIN ? (
            <Navigate to="/admin/dashboard" replace />
          ) : user.role === UserRole.PHARMACIST ? (
            <Navigate to="/pos" replace />
          ) : (
            <Navigate to="/admin/dashboard" replace />
          )
        ) : (
          <Navigate to="/login" replace />
        )
      } />
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
