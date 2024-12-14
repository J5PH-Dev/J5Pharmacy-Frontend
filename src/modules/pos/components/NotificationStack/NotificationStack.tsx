import React from 'react';
import { Snackbar, Alert, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface Notification {
  id: string;
  message: string;
  severity: 'success' | 'warning' | 'error' | 'info';
}

interface NotificationStackProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

const StyledSnackbar = styled(Snackbar)(({ theme }) => ({
  position: 'fixed',
  '& .MuiPaper-root': {
    minWidth: '400px',
    fontSize: '1.1rem'
  }
}));

const NotificationStack: React.FC<NotificationStackProps> = ({
  notifications,
  onClose
}) => {
  return (
    <Box>
      {notifications.map((notification, index) => (
        <StyledSnackbar
          key={notification.id}
          open={true}
          autoHideDuration={3000}
          onClose={() => onClose(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            top: `${24 + index * 80}px !important`,
            transition: 'top 0.2s ease-out'
          }}
        >
          <Alert
            severity={notification.severity}
            onClose={() => onClose(notification.id)}
            sx={{
              width: '100%',
              '& .MuiAlert-message': {
                fontSize: '1.1rem',
                padding: '8px 0'
              },
              '& .MuiAlert-icon': {
                fontSize: '2rem'
              }
            }}
          >
            {notification.message}
          </Alert>
        </StyledSnackbar>
      ))}
    </Box>
  );
};

export default NotificationStack; 