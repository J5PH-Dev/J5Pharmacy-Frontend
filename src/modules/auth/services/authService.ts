import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface LoginResponse {
    token: string;
    user?: {
        name: string;
        role: string;
        employeeId: string;
        branchId: number;
    };
    pharmacist?: {
        name: string;
        staffId: number;
        branchId: number;
        sessionId: number;
        salesSessionId: number;
        branch_name: string;
        loginTime: string;
    };
}

export const pmsLogin = async (employee_id: string, password: string): Promise<LoginResponse> => {
    const response = await axios.post(`${API_URL}/auth/pms/login`, {
        employee_id,
        password
    });
    
    // Store user information in localStorage
    if (response.data.user) {
        const userData = {
            ...response.data.user,
            user_id: response.data.user.user_id
        };
        localStorage.setItem('user', JSON.stringify(userData));
    }
    
    // Store token
    if (response.data.token) {
        setAuthToken(response.data.token);
    }
    
    return response.data;
};

export const posLogin = async (pin_code: string): Promise<LoginResponse> => {
    const response = await axios.post(`${API_URL}/auth/pos/login`, {
        pin_code
    });
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('salesSessionId');
    removeAuthToken();
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const setAuthToken = (token: string) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeAuthToken = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
};

export const forgotPassword = async (employee_id: string, email: string) => {
    try {
        const response = await axios.post(`${API_URL}/auth/forgot-password`, {
            employee_id,
            email
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Error processing request' };
    }
};

export const verifyResetToken = async (employee_id: string, token: string) => {
    try {
        const response = await axios.post(`${API_URL}/auth/verify-reset-token`, {
            employee_id,
            token
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Error verifying token' };
    }
};

export const resetPassword = async (employee_id: string, token: string, new_password: string) => {
    try {
        const response = await axios.post(`${API_URL}/auth/reset-password`, {
            employee_id,
            token,
            new_password
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Error resetting password' };
    }
};
