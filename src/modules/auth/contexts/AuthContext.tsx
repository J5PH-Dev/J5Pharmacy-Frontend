import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';

interface AuthContextType {
    isAuthenticated: boolean;
    user: any;
    loading: boolean;
    pmsLogin: (employee_id: string, password: string) => Promise<void>;
    posLogin: (pin_code: string) => Promise<void>;
    login: (employee_id: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check for token and user data on mount
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            authService.setAuthToken(token);
            setUser(JSON.parse(userData));
            setIsAuthenticated(true);
        }
        
        setLoading(false);
    }, []);

    const login = async (employee_id: string, password: string) => {
        try {
            const response = await authService.pmsLogin(employee_id, password);
            
            if (!response.user) {
                throw new Error('Invalid response: user data missing');
            }

            authService.setAuthToken(response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            setUser(response.user);
            setIsAuthenticated(true);
            
            // Navigate based on user role
            const userRole = response.user.role;
            if (userRole === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (userRole === 'MANAGER') {
                navigate('/manager/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const pmsLogin = async (employee_id: string, password: string) => {
        try {
            const response = await authService.pmsLogin(employee_id, password);
            
            if (!response.user) {
                throw new Error('Invalid response: user data missing');
            }

            authService.setAuthToken(response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            setUser(response.user);
            setIsAuthenticated(true);

            // PMS users go through loading screen
            navigate('/loading-screen');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const posLogin = async (pin_code: string) => {
        try {
            const response = await authService.posLogin(pin_code);
            
            if (!response.pharmacist) {
                throw new Error('Invalid response: pharmacist data missing');
            }

            console.log('Login response:', response); // Debug login response
            
            // Store token first
            authService.setAuthToken(response.token);
            localStorage.setItem('token', response.token);
            console.log('Token stored:', response.token); // Debug token storage

            // Store pharmacist data
            const pharmacistData = {
                ...response.pharmacist,
                staffId: response.pharmacist.staffId,
                isPOS: true
            };
            
            localStorage.setItem('user', JSON.stringify(pharmacistData));
            console.log('User data stored:', pharmacistData); // Debug user storage
            
            localStorage.setItem('salesSessionId', response.pharmacist.salesSessionId.toString());
            
            setUser(pharmacistData);
            setIsAuthenticated(true);
            
            console.log('POS Login successful:', { token: response.token, user: pharmacistData }); // Debug log
            
            navigate('/loading-screen');
        } catch (error) {
            console.error('POS Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        authService.removeAuthToken();
        localStorage.removeItem('salesSessionId');
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            loading,
            pmsLogin,
            posLogin,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
