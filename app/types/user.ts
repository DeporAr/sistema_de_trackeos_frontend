export type UserRole = "admin" | "user" | "supervisor";

export interface Role {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Authority {
  authority: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: Role;
  avatar?: string;
  enabled: boolean;
  authorities: Authority[];
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  createdAt: string;
  updatedAt: string;
}
