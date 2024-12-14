import { useState } from 'react';
import { AlertColor } from '@mui/material';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export const useSnackbar = () => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info'
  });

  const showMessage = (message: string, severity: AlertColor = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  return { snackbar, setSnackbar, showMessage };
}; 