export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  PHARMACIST = 'PHARMACIST',
}

export interface User {
  employeeId: number;
  role: UserRole;
  password?: string; // Added for mock authentication
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (employeeId: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (employeeId: string, email: string) => Promise<boolean>;
}
