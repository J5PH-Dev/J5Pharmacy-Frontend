import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import theme from './theme/theme';
import { AuthProvider } from './core/contexts/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout/DashboardLayout';
import { UserRole } from './core/types/roles';

// Import pages
import POSPage from './modules/pos/pages/POSPage';
import LoginPage from './core/components/LoginPage';
import DashboardPage from './modules/dashboard/pages/DashboardPage';
import BranchManagementPage from './modules/branch/pages/BranchManagementPage';
import InventoryPage from './modules/inventory/pages/InventoryPage';
import CustomersPage from './modules/customers/pages/CustomersPage';
import AnalyticsPage from './modules/analytics/pages/AnalyticsPage';
import UserManagementPage from './modules/admin/pages/UserManagementPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Redirect root to appropriate page */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* POS Route - Accessible by all roles */}
            <Route
              path="/pos"
              element={
                <ProtectedRoute>
                  <POSPage />
                </ProtectedRoute>
              }
            />

            {/* Dashboard Routes - Protected by role */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                  <DashboardLayout>
                    <DashboardPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Only Routes */}
            <Route
              path="/branches/*"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <DashboardLayout>
                    <BranchManagementPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/users/*"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <DashboardLayout>
                    <UserManagementPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin and Manager Routes */}
            <Route
              path="/inventory/*"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                  <DashboardLayout>
                    <InventoryPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/customers/*"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                  <DashboardLayout>
                    <CustomersPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics/*"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                  <DashboardLayout>
                    <AnalyticsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to appropriate dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
