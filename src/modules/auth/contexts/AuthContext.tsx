import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, AuthState, UserRole } from '../types/auth.types';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database - replace with actual backend integration
const MOCK_USERS: Record<number, { employeeId: number; role: UserRole; name: string }> = {
  123: { employeeId: 123, role: UserRole.ADMIN, name: 'Admin User' },
  456: { employeeId: 456, role: UserRole.MANAGER, name: 'Manager User' },
  678: { employeeId: 678, role: UserRole.PHARMACIST, name: 'Pharmacist User' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Clear any existing session on app start
    localStorage.removeItem('user');
    return {
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    };
  });

  const getInitialRouteForRole = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
        return '/admin/dashboard';
      case UserRole.MANAGER:
        return '/manager/dashboard';
      case UserRole.PHARMACIST:
        return '/pos';
      default:
        return '/login';
    }
  };

  const login = async (employeeId: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // Convert employeeId to number for comparison
      const empId = parseInt(employeeId, 10);
      if (isNaN(empId)) {
        throw new Error('Invalid Employee ID');
      }

      // Mock authentication - replace with actual backend call
      const mockUser = MOCK_USERS[empId];
      if (!mockUser) {
        throw new Error('Invalid credentials');
      }

      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));

      setAuthState({
        isAuthenticated: true,
        user: mockUser,
        isLoading: false,
        error: null,
      });

      // Navigate based on role
      const initialRoute = getInitialRouteForRole(mockUser.role);
      navigate(initialRoute);
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Invalid credentials',
      }));
      throw error; // Re-throw to handle in the component
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    });
    navigate('/login');
  };

  const resetPassword = async (employeeId: string, email: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // TODO: Implement actual password reset logic
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
      return true;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Password reset failed',
      }));
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
