import { createContext } from "react";
import type {
  ActionResult,
  LoginResult,
  SignupInput,
  SignupResult,
  User,
  UserRole,
} from "@/types/auth";

export interface AuthContextValue {
  /** Display-only copy of the session user from `/v1/me`. The server enforces permissions. */
  user: User | null;
  isAuthenticated: boolean;
  /** True while the initial session check is in flight. */
  isLoading: boolean;
  /** True when running without a backend (VITE_API_BASE_URL unset). */
  isMockAuth: boolean;
  /**
   * `portal` is the role of the login surface the caller is on (e.g.
   * `/agent/login` passes "agent"). It is supplied by the page, never by
   * the visitor, and the server rejects it if it doesn't match the
   * account's Cognito group.
   */
  login: (
    email: string,
    password: string,
    portal: UserRole,
  ) => Promise<LoginResult>;
  completeNewPassword: (
    newPassword: string,
    portal: UserRole,
  ) => Promise<LoginResult>;
  signup: (data: SignupInput) => Promise<SignupResult>;
  confirmSignup: (email: string, code: string) => Promise<ActionResult>;
  resendSignupCode: (email: string) => Promise<ActionResult>;
  forgotPassword: (email: string) => Promise<ActionResult>;
  resetPassword: (
    email: string,
    code: string,
    newPassword: string,
  ) => Promise<ActionResult>;
  logout: () => Promise<void>;
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

const NO_PROVIDER = {
  status: "error",
  code: "no_provider",
  message: "AuthProvider is missing.",
} as const;

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isMockAuth: true,
  login: async () => NO_PROVIDER,
  completeNewPassword: async () => NO_PROVIDER,
  signup: async () => NO_PROVIDER,
  confirmSignup: async () => NO_PROVIDER,
  resendSignupCode: async () => NO_PROVIDER,
  forgotPassword: async () => NO_PROVIDER,
  resetPassword: async () => NO_PROVIDER,
  logout: async () => {},
});
