import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from '../modules/auth/types/auth.types';
import AdminLayout from '../modules/dashboard/components/layout/AdminLayout';
import DashboardPage from '../modules/dashboard/pages/DashboardPage';
import UserManagementPage from '../modules/admin/pages/UserManagementPage';
import BranchManagementPage from '../modules/branch/pages/BranchManagementPage';
import ResourcesPage from '../modules/adminDashboard/components/pages/ResourcesPage';
import SupplierManagement from '../modules/adminDashboard/components/pages/ResourcesSubPages/SupplierManagement';
import BulkInventoryImport from '../modules/adminDashboard/components/pages/ResourcesSubPages/BulkInventoryImport';
import PriceManagement from '../modules/adminDashboard/components/pages/ResourcesSubPages/PriceManagement';
import ArchivedSupplierManagement from '../modules/adminDashboard/components/pages/ResourcesSubPages/ArchivedSupplierManagement';

const AdminRoutes: React.FC = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/branches" element={<BranchManagementPage />} />
        
        {/* Resource Management Routes */}
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/resources/supplier-management" element={<SupplierManagement />} />
        <Route path="/resources/archived-suppliers" element={<ArchivedSupplierManagement />} />
        <Route path="/resources/bulk-inventory-import" element={<BulkInventoryImport />} />
        <Route path="/resources/price-management" element={<PriceManagement />} />
        
        {/* Add more admin routes here */}
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;
