import { useState, type ReactNode } from "react";
import type { SignupInput, User, UserRole } from "@/types/auth";
import { AuthContext, DEMO_ADMIN, type AuthContextValue } from "./auth-context";

/**
 * TODO(AWS integration): replace this demo-only provider with one backed by
 * Amazon Cognito (see `lib/aws/cognito.ts` once added) and a persisted
 * session (httpOnly cookie or secure storage), instead of in-memory state
 * that resets on refresh and accepts any password.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEMO_ADMIN);

  const loginAsDemo = (role: UserRole = "admin") => {
    setUser({ ...DEMO_ADMIN, role });
  };

  const login: AuthContextValue["login"] = (
    _email,
    _password,
    role = "admin",
  ) => {
    const loggedInUser: User = { ...DEMO_ADMIN, role };
    setUser(loggedInUser);
    return { success: true, user: loggedInUser };
  };

  const signup = (data: SignupInput) => {
    const newUser: User = {
      ...DEMO_ADMIN,
      name: `${data.firstName} ${data.lastName}`.trim() || "Demo User",
      email: data.email || "demo@skylife.com",
      role: data.role || "client",
    };
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginAsDemo,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
