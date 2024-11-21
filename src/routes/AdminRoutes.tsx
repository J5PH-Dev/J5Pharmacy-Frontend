import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from '../modules/auth/types/auth.types';
import AdminLayout from '../modules/dashboard/components/layout/AdminLayout';
import DashboardPage from '../modules/dashboard/pages/DashboardPage';
import UserManagementPage from '../modules/admin/pages/UserManagementPage';
import BranchManagementPage from '../modules/branch/pages/BranchManagementPage';

const AdminRoutes: React.FC = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/branches" element={<BranchManagementPage />} />
        {/* Add more admin routes here */}
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;
