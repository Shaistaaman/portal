import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LoginResult, User } from "@/types/auth";
import { authApi, isMockAuth } from "./authApi";
import { AuthContext, type AuthContextValue } from "./auth-context";

/**
 * Session state for the portal.
 *
 * Tokens are never held here. In live mode the backend keeps them and the
 * browser carries an HttpOnly session cookie (backend-config.md §10.1);
 * this provider only stores the display copy of the user returned by
 * `/v1/me` or a successful login. Route guards built on it are UX only —
 * every API call is re-authorised server-side.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore an existing session (cookie) on first load.
  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then((current) => {
        if (!cancelled) setUser(current);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const applyLogin = useCallback((result: LoginResult) => {
    if (result.status === "ok") setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await authApi.logout();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      isMockAuth,
      login: async (email, password, portal) =>
        applyLogin(await authApi.login(email, password, portal)),
      completeNewPassword: async (newPassword, portal) =>
        applyLogin(await authApi.completeNewPassword(newPassword, portal)),
      signup: (data) => authApi.signup(data),
      confirmSignup: (email, code) => authApi.confirmSignup(email, code),
      resendSignupCode: (email) => authApi.resendSignupCode(email),
      forgotPassword: (email) => authApi.forgotPassword(email),
      resetPassword: (email, code, newPassword) =>
        authApi.resetPassword(email, code, newPassword),
      logout,
    }),
    [user, isLoading, applyLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
