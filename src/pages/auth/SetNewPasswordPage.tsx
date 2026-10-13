import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import {
  DASHBOARD_PATH_BY_ROLE,
  LOGIN_PATH_BY_ROLE,
  parseRole,
  safeRedirect,
  withQuery,
} from "@/auth/authPaths";
import { meetsPasswordPolicy } from "@/auth/passwordPolicy";
import {
  AuthCard,
  AuthPageLayout,
  AuthSubmitButton,
  PasswordRequirements,
} from "@/features/auth/AuthCard";
import { AUTH_INPUT_CLASS, AUTH_LINK_CLASS } from "@/features/auth/authStyles";

/**
 * First-login step for admin-created accounts. The admin creates the user,
 * Cognito emails a temporary password, and the first login returns a
 * NEW_PASSWORD_REQUIRED challenge. The backend keeps the challenge session
 * in a short-lived HttpOnly cookie, so this page only sends the new
 * password. On success the user is signed in.
 *
 * `?role=` is the login surface the user came from; the server checks it
 * against the account's group again before issuing the session.
 */
export default function SetNewPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeNewPassword } = useAuth();

  const role = parseRole(searchParams.get("role"));
  const loginPath = LOGIN_PATH_BY_ROLE[role];
  const dashboard = DASHBOARD_PATH_BY_ROLE[role];
  const redirectTo = safeRedirect(searchParams.get("redirect"), dashboard);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!meetsPasswordPolicy(password)) {
      setError("Your new password doesn't meet all the requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The two passwords don't match.");
      return;
    }

    setIsLoading(true);
    setError(null);
    const result = await completeNewPassword(password, role);
    setIsLoading(false);

    switch (result.status) {
      case "ok":
        navigate(redirectTo, { replace: true });
        return;
      case "error":
        if (result.code === "session_expired") {
          navigate(withQuery(loginPath, { notice: "expired" }), { replace: true });
          return;
        }
        setError(result.message);
        return;
      default:
        // Any other challenge means the flow needs restarting from login.
        navigate(withQuery(loginPath, { notice: "expired" }), { replace: true });
    }
  };

  return (
    <AuthPageLayout>
      <AuthCard
        heading="Set your password"
        description="Welcome to Skylife. For security, choose a new password to replace the temporary one we emailed you."
        error={error}
        footer={
          <>
            Not you?{" "}
            <Link to={loginPath} className={AUTH_LINK_CLASS}>
              Back to login
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="sr-only" htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              required
              aria-describedby="new-password-rules"
              className={AUTH_INPUT_CLASS}
            />
            <PasswordRequirements id="new-password-rules" password={password} />
          </div>

          <div>
            <label className="sr-only" htmlFor="new-password-confirm">
              Confirm new password
            </label>
            <input
              id="new-password-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className={AUTH_INPUT_CLASS}
            />
          </div>

          <AuthSubmitButton
            isLoading={isLoading}
            label="Set password and continue"
            loadingLabel="Saving..."
          />
        </form>
      </AuthCard>
    </AuthPageLayout>
  );
}
