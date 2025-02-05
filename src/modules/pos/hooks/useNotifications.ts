import { useState, useCallback } from 'react';
import { NotificationState } from '../components/common/Notifications';
import { useErrorLogging } from './useErrorLogging';

export const useNotifications = () => {
    const [notification, setNotification] = useState<NotificationState>({
        open: false,
        message: '',
        type: 'info',
        autoHide: true
    });
    
    const { errorLogs, logError, clearLogs, copyLogs } = useErrorLogging();
    const [isErrorLogsOpen, setIsErrorLogsOpen] = useState(false);

    const showNotification = useCallback((message: string, type: NotificationState['type'] = 'info', error?: any) => {
        if (type === 'error' && error) {
            logError(error);
        }

        setNotification({
            open: true,
            message,
            type,
            autoHide: type !== 'error'
        });
    }, [logError]);

    const hideNotification = useCallback(() => {
        setNotification(prev => ({ ...prev, open: false }));
    }, []);

    const handleErrorClick = useCallback(() => {
        setIsErrorLogsOpen(true);
    }, []);

    return {
        notification,
        setNotification,
        showNotification,
        hideNotification,
        errorLogs,
        isErrorLogsOpen,
        setIsErrorLogsOpen,
        handleErrorClick,
        copyLogs
    };
}; 