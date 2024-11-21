export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  PHARMACIST = 'PHARMACIST',
}

export interface User {
  employeeId: number;
  password: string;
  role: UserRole;
  name: string;
}

export type UserWithoutPassword = Omit<User, 'password'>;