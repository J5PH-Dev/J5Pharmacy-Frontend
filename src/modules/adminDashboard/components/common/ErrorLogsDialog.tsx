import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ErrorLog } from '../../types/errorLog';

interface ErrorLogsDialogProps {
    open: boolean;
    onClose: () => void;
    errorLogs: ErrorLog[];
    onCopyLogs: () => void;
}

export const ErrorLogsDialog: React.FC<ErrorLogsDialogProps> = ({
    open,
    onClose,
    errorLogs,
    onCopyLogs
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Error Logs</Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={onCopyLogs}
                        startIcon={<ContentCopyIcon />}
                    >
                        Copy Text
                    </Button>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ 
                    maxHeight: '400px', 
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    bgcolor: '#f5f5f5',
                    p: 2,
                    borderRadius: 1
                }}>
                    {errorLogs.map((log, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                            <Typography color="error" variant="subtitle2">
                                [{log.timestamp}]
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                User: {log.user.name} ({log.user.employeeId}) - {log.user.role}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                Error: {log.error}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                Details: {JSON.stringify(log.details, null, 2)}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}; 