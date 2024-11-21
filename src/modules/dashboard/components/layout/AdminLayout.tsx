import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar';

const LayoutContainer = styled(Box)({
  display: 'flex',
  minHeight: '100vh',
  overflow: 'hidden', // Prevent scrolling on the container
});

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.default,
  position: 'relative',
  height: '100vh',
  overflow: 'hidden',
}));

const ContentArea = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  overflowY: 'auto',
  height: 'calc(100vh - 80px)', // Subtract header height
  marginTop: '80px', // Add margin for the fixed header
}));

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <LayoutContainer>
      <Sidebar />
      <MainContent>
        <AdminHeader />
        <ContentArea>
          {children}
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default AdminLayout;
