import React from 'react';
import { Snackbar, Button, IconButton } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';

export interface NotificationState {
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    autoHide?: boolean;
}

interface NotificationProps {
    notification: NotificationState;
    setNotification: React.Dispatch<React.SetStateAction<NotificationState>>;
    onErrorClick?: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ 
    notification, 
    setNotification,
    onErrorClick 
}) => {
    return (
        <Snackbar 
            open={notification.open} 
            autoHideDuration={notification.autoHide ? 5000 : null}
            onClose={() => notification.autoHide && setNotification(prev => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <MuiAlert
                elevation={6}
                variant="filled"
                severity={notification.type}
                action={
                    <>
                        {notification.type === 'error' && onErrorClick && (
                            <Button
                                color="inherit" 
                                size="small"
                                onClick={onErrorClick}
                            >
                                See error logs
                            </Button>
                        )}
                        <IconButton
                            size="small"
                            color="inherit"
                            onClick={() => setNotification(prev => ({ ...prev, open: false }))}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </>
                }
            >
                {notification.message}
            </MuiAlert>
        </Snackbar>
    );
}; 