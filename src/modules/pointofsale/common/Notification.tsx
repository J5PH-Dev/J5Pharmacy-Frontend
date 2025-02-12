import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

export interface NotificationProps {
  open: boolean;
  message: string;
  severity: AlertColor;
  onClose: () => void;
  autoHideDuration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = 3000
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={onClose} 
        severity={severity}
        variant="filled"
        sx={{ 
          minWidth: '300px',
          '& .MuiAlert-message': {
            fontSize: '1rem'
          }
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
