import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import axios from 'axios';

interface AuthContextType {
    isAuthenticated: boolean;
    user: any;
    loading: boolean;
    pmsLogin: (employee_id: string, password: string) => Promise<void>;
    posLogin: (pin_code: string) => Promise<void>;
    login: (employee_id: string, password: string) => Promise<void>;
    logout: () => void;
    currentSession: {
        pharmacistSessionId: number | null;
        salesSessionId: number | null;
        branchId: number | null;
        branchCode: string | null;
    };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentSession, setCurrentSession] = useState<{
        pharmacistSessionId: number | null;
        salesSessionId: number | null;
        branchId: number | null;
        branchCode: string | null;
    }>({
        pharmacistSessionId: null,
        salesSessionId: null,
        branchId: null,
        branchCode: null
    });
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
                throw new Error('Invalid login response');
            }

            // Create new sales session
            const sessionResponse = await axios.post('/api/pos/sessions', 
                { branchId: response.user.branchId },
                { withCredentials: true }
            );

            setUser(response.user);
            setIsAuthenticated(true);
            
            // Navigate based on user role
            const userRole = response.user.role;
            if (userRole === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (userRole === 'MANAGER') {
                navigate('/manager/dashboard');
            }

            setCurrentSession({
                pharmacistSessionId: sessionResponse.data.pharmacistSessionId,
                salesSessionId: sessionResponse.data.sessionId,
                branchId: response.user.branchId,
                branchCode: response.user.branchCode
            });
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

            // Update current session state
            setCurrentSession({
                salesSessionId: response.pharmacist.salesSessionId || null,
                pharmacistSessionId: response.pharmacist.sessionId || null,
                branchId: response.pharmacist.branchId || null,
                branchCode: response.pharmacist.branchCode || null
            });

            // Store pharmacist data
            const pharmacistData = {
                ...response.pharmacist,
                staffId: response.pharmacist.staffId,
                isPOS: true
            };


            authService.setAuthToken(response.token);
            localStorage.setItem('user', JSON.stringify(pharmacistData));
            localStorage.setItem('salesSessionId', response.pharmacist.salesSessionId.toString());
            
            setUser(pharmacistData);
            setIsAuthenticated(true);
            
            // POS users also go through loading screen now
            navigate('/loading-screen');
        } catch (error) {
            console.error('POS Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            console.log('Logging out with session:', currentSession);
            
            if (currentSession?.pharmacistSessionId) {
                const response = await axios.post('/api/auth/end-pharmacist-session', {}, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (!response.data.success) {
                    console.error('Error ending session:', response.data.message);
                }
            }

            // Clear local storage and state regardless of session end result
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setCurrentSession({
                pharmacistSessionId: null,
                salesSessionId: null,
                branchId: null,
                branchCode: null
            });
            
            // Navigate to loading screen
            navigate('/loading-screen', { state: { isLoggingOut: true } });

        } catch (error) {
            console.error('Logout error:', error);
            // Still clear everything even if session end fails
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setCurrentSession({
                pharmacistSessionId: null,
                salesSessionId: null,
                branchId: null,
                branchCode: null
            });
            navigate('/loading-screen', { state: { isLoggingOut: true } });
        }
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            loading,
            pmsLogin,
            posLogin,
            login,
            logout,
            currentSession
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
