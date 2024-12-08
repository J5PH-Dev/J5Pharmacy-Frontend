import { User, UserRole, UserWithoutPassword } from '../types/User';

// Mock user database - replace with actual backend integration
const mockUsers: User[] = [
  {
    employeeId: 123,
    role: UserRole.ADMIN,
    password: 'admin123',
    name: 'Admin User',
  },
  {
    employeeId: 456,
    role: UserRole.MANAGER,
    password: 'manager123',
    name: 'Manager User',
  },
  {
    employeeId: 678,
    role: UserRole.PHARMACIST,
    password: 'pharm123',
    name: 'Pharmacist User',
  },
];

export const authService = {
  login: async (employeeId: string, password: string): Promise<UserWithoutPassword> => {
    const numericEmployeeId = parseInt(employeeId, 10);
    const user = mockUsers.find(u => u.employeeId === numericEmployeeId && u.password === password);

    if (!user) {
      throw new Error('Invalid credentials');
    }
    if (user.role === UserRole.MANAGER) {
      window.location.href = '/manager/dashboard';
    } else if (user.role === UserRole.ADMIN) {
      window.location.href = '/admin/dashboard';
    }
    
    // For pharmacists, redirect directly to POS
    if (user.role === UserRole.PHARMACIST) {
      window.location.href = '/pos';
    } else if (user.role === UserRole.ADMIN) {
      window.location.href = '/admin/dashboard';
    }

    // Remove password before returning the user
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as UserWithoutPassword;
  },

  logout: async (): Promise<void> => {
    // Clear any stored user data
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: (): User | null => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  },
};
