import { useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../../auth/contexts/AuthContext';

interface ErrorLog {
    timestamp: string;
    user: {
        name: string;
        employeeId: string;
        role: string;
    };
    error: string;
    details: any;
}

export const useErrorLogging = () => {
    const { user } = useAuth();
    const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);

    const logError = (error: any, details?: any) => {
        const newLog: ErrorLog = {
            timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            user: {
                name: user?.name || 'Unknown',
                employeeId: user?.employee_id || 'Unknown',
                role: user?.role || 'Unknown'
            },
            error: error?.message || String(error),
            details: details || error
        };

        setErrorLogs(prev => [newLog, ...prev]);
        return newLog;
    };

    const clearLogs = () => {
        setErrorLogs([]);
    };

    const copyLogs = () => {
        const logText = errorLogs
            .map(log => {
                return `[${log.timestamp}]\nUser: ${log.user.name} (${log.user.employeeId}) - ${log.user.role}\nError: ${log.error}\nDetails: ${JSON.stringify(log.details, null, 2)}\n`;
            })
            .join('\n---\n\n');
        
        navigator.clipboard.writeText(logText);
    };

    return {
        errorLogs,
        logError,
        clearLogs,
        copyLogs
    };
}; 