import { createContext } from "react";
import type { AuthResult, SignupInput, User, UserRole } from "@/types/auth";

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  /** Demo-only: sets the current user to a given role without validating credentials. */
  loginAsDemo: (role?: UserRole) => void;
  /**
   * Demo-only: does not validate the password against a backend. `role`
   * is the role of the login surface the caller is on (e.g. `/agent/login`
   * passes "agent") — a stand-in for the Cognito group claim a real
   * sign-in response would carry. It is supplied by the page, never by
   * the visitor, so it does not reintroduce a role picker.
   */
  login: (email: string, password?: string, role?: UserRole) => AuthResult;
  /** Demo-only: does not persist the new user anywhere. */
  signup: (data: SignupInput) => AuthResult;
  logout: () => void;
}

export const DEMO_ADMIN: User = {
  id: "usr-admin-1",
  name: "Martina Vance",
  firstName: "Martina",
  lastName: "Vance",
  email: "martina@skylifemanagement.com",
  username: "martina.vance",
  role: "admin",
  avatarUrl:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop",
  status: "active",
  createdAt: "2024-01-15T08:00:00Z",
};

export const AuthContext = createContext<AuthContextValue>({
  user: DEMO_ADMIN,
  isAuthenticated: true,
  loginAsDemo: () => {},
  login: () => ({ success: true, user: DEMO_ADMIN }),
  signup: () => ({ success: true, user: DEMO_ADMIN }),
  logout: () => {},
});
