import { useState, useCallback } from 'react';
import { NotificationState } from '../components/common/Notification';

export const useNotification = () => {
    const [notification, setNotification] = useState<NotificationState>({
        open: false,
        message: '',
        type: 'success',
        autoHide: true
    });

    const handleNotification = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning', autoHide: boolean = true) => {
        const shouldAutoHide = type === 'success' ? autoHide : false;

        setNotification({
            open: true,
            message,
            type,
            autoHide: shouldAutoHide
        });

        if (shouldAutoHide) {
            setTimeout(() => {
                setNotification(prev => ({ ...prev, open: false }));
            }, 5000);
        }
    }, []);

    return {
        notification,
        setNotification,
        handleNotification
    };
}; 