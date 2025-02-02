import { useState, useCallback } from 'react';
import { ErrorLog } from '../types/errorLog';

export const useErrorLogs = () => {
    const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
    const [showErrorDialog, setShowErrorDialog] = useState(false);

    const logError = useCallback((error: any) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        const newErrorLog: ErrorLog = {
            timestamp: new Date().toLocaleString('en-US', { 
                timeZone: 'Asia/Manila',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            }),
            user: {
                name: user.name || 'Unknown',
                employeeId: user.employeeId || 'Unknown',
                role: user.role || 'Unknown'
            },
            error: error.message || 'Unknown error',
            details: error.response?.data || error
        };
        setErrorLogs(prev => [...prev, newErrorLog]);
    }, []);

    const copyErrorLogs = useCallback(() => {
        const logText = errorLogs
            .map(log => {
                return `[${log.timestamp}]
User: ${log.user.name} (${log.user.employeeId}) - ${log.user.role}
Error: ${log.error}
Details: ${JSON.stringify(log.details, null, 2)}
`;
            })
            .join('\n---\n\n');

        navigator.clipboard.writeText(logText);
    }, [errorLogs]);

    return {
        errorLogs,
        setErrorLogs,
        showErrorDialog,
        setShowErrorDialog,
        logError,
        copyErrorLogs
    };
}; 