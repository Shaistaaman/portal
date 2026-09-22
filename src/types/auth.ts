export type UserRole = "admin" | "agent" | "client" | "owner";

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  username: string;
  role: UserRole;
  avatarUrl: string;
  phone?: string;
  status: "active" | "pending" | "suspended";
  createdAt: string;
}

export interface SignupInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}
