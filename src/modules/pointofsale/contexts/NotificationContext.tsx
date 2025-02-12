import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertColor } from '@mui/material';
import Notification from '../common/Notification';
import ErrorLogsDialog from '../common/ErrorLogsDialog';
import { ErrorLog } from '../common/ErrorLogsDialog';

interface NotificationContextType {
  showNotification: (message: string, severity: AlertColor) => void;
  showError: (error: Error | string, details?: { component?: string; action?: string }) => void;
  openErrorLogs: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [isErrorLogsOpen, setIsErrorLogsOpen] = useState(false);

  const showNotification = useCallback((message: string, severity: AlertColor) => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, []);

  const showError = useCallback((error: Error | string, details?: { component?: string; action?: string }) => {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorDetails = error instanceof Error ? error.stack || error.message : error;

    // Add to error logs
    setErrorLogs(prev => [{
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      error: errorMessage,
      details: errorDetails,
      ...details
    }, ...prev]);

    // Show notification
    showNotification(errorMessage, 'error');
  }, [showNotification]);

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleClearAllErrors = () => {
    setErrorLogs([]);
  };

  const handleDeleteError = (id: string) => {
    setErrorLogs(prev => prev.filter(error => error.id !== id));
  };

  return (
    <NotificationContext.Provider value={{
      showNotification,
      showError,
      openErrorLogs: () => setIsErrorLogsOpen(true)
    }}>
      {children}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
      <ErrorLogsDialog
        open={isErrorLogsOpen}
        onClose={() => setIsErrorLogsOpen(false)}
        errors={errorLogs}
        onClearAll={handleClearAllErrors}
        onDeleteError={handleDeleteError}
      />
    </NotificationContext.Provider>
  );
}; 