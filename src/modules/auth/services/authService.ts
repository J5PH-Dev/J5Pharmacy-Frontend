import { User, UserRole } from '../types/auth.types';

// Mock user database - replace with actual backend integration
const mockUsers: User[] = [
  {
    employeeId: 123,
    role: UserRole.ADMIN,
    password: 'admin123',
  },
  {
    employeeId: 456,
    role: UserRole.MANAGER,
    password: 'manager123',
  },
  {
    employeeId: 678,
    role: UserRole.PHARMACIST,
    password: 'pharm123',
  },
];

export const authService = {
  login: async (employeeId: string, password: string): Promise<User> => {
    const numericEmployeeId = parseInt(employeeId, 10);
    const user = mockUsers.find(u => u.employeeId === numericEmployeeId && u.password === password);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // For pharmacists, redirect directly to POS
    if (user.role === UserRole.PHARMACIST) {
      window.location.href = '/pos';
    }

    // Remove password before returning the user
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  logout: async (): Promise<void> => {
    // TODO: Implement actual API call
    return Promise.resolve();
  },

  resetPassword: async (employeeId: string): Promise<void> => {
    const numericEmployeeId = parseInt(employeeId, 10);
    const user = mockUsers.find(u => u.employeeId === numericEmployeeId);

    if (!user) {
      throw new Error('Employee not found');
    }

    // In a real application, this would trigger a password reset email
    console.log(`Password reset requested for employee ${employeeId}`);
  },
};
