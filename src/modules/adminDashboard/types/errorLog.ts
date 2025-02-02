export interface ErrorLog {
    timestamp: string;
    user: {
        name: string;
        employeeId: string;
        role: string;
    };
    error: string;
    details?: any;
} 