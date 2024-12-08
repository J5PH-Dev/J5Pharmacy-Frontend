import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import ManagerLayout from './ManagerLayout';
import BranchesPage from './components/pages/BranchesPage'; // Assuming this is your dashboard component
import CustomerInfoPage from './components/pages/CustomerInfoPage'; // Assuming this is your dashboard component
import DashboardPage from './components/pages/DashboardPage'; // Assuming this is your dashboard component
import EmployeeStaffPage from './components/pages/EmployeeStaffPage'; // Assuming this is your dashboard component
import InventoryPage from './components/pages/InventoryPage'; // Assuming this is your dashboard component
import NotificationPage from './components/pages/NotificationPage'; // Assuming this is your dashboard component
import ReportsPage from './components/pages/ReportsPage'; // Assuming this is your dashboard component
import SettingsPage from './components/pages/SettingsPage'; // Assuming this is your dashboard component
import MedicinesAvailablePage from './components/pages/InventorySubPages/MedicinesAvailablePage';
import ViewMedicineDescription  from './components/pages/InventorySubPages/VIewMedicineDescription';
import MedicineGroupPage from './components/pages/InventorySubPages/MedicineGroupPage';
import ViewGroupDetails from './components/pages/InventorySubPages/ViewGroupDetails';

const ManagerRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Admin Layout wrapper */}
      <Route path="/" element={<ManagerLayout />}>
        {/* Default route redirects to dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} /> {/* index is the default route */}

        {/* Admin nested routes */}
        <Route path="dashboard" element={<DashboardPage />} />


        <Route path="inventory" element={<InventoryPage />} />

        {/* Dynamic Routes for Item Details */}
        <Route path="inventory/view-medicines-available" element={<MedicinesAvailablePage />} />
        <Route path="inventory/view-medicines-description/:medicineName" element={<ViewMedicineDescription />} />

        <Route path="inventory/view-medicines-group" element={<MedicineGroupPage />} />
        <Route path="inventory/view-medicines-group/:groupName" element={<ViewGroupDetails />} />


        <Route path="branches" element={<BranchesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="employee-staff" element={<EmployeeStaffPage />} />
        <Route path="customer-info" element={<CustomerInfoPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="notifications" element={<NotificationPage />} />
      </Route>
    </Routes>
  );
};

export default ManagerRoutes;