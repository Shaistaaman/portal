import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { withQuery } from "@/auth/authPaths";
import type { UserRole } from "@/types/auth";

/**
 * Login submit flow shared by every role's login page. Routes to the
 * follow-up screen Cognito asks for (set new password, confirm email)
 * or to `redirectTo` on success.
 */
export function useLoginSubmit(role: UserRole, redirectTo: string) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (email: string, password: string) => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const result = await login(email, password, role);
    setIsLoading(false);

    switch (result.status) {
      case "ok":
        navigate(redirectTo, { replace: true });
        return;
      case "new_password_required":
        navigate(withQuery("/set-password", { role, redirect: redirectTo }));
        return;
      case "unconfirmed":
        navigate(withQuery("/confirm-signup", { email, redirect: redirectTo }));
        return;
      case "error":
        setError(result.message);
        return;
    }
  };

  return { submit, isLoading, error };
}
