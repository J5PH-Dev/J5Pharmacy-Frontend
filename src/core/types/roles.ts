export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  PHARMACIST = 'PHARMACIST'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  branchId?: string;
}

export interface Permission {
  module: string;
  actions: string[];
}
