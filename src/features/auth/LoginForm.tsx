import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { UserRole } from "@/types/auth";
import { AuthCard, AuthSubmitButton } from "./AuthCard";
import { AUTH_INPUT_CLASS } from "./authStyles";

export interface LoginFormProps {
  /** The role this login surface is scoped to. Not user-selectable. */
  role: UserRole;
  heading: string;
  /** Called with the submitted credentials once client-side validation passes. */
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
  error?: string | null;
  /** Success/info message, e.g. after verifying an email or resetting a password. */
  notice?: string | null;
  /** Link target for "Forgot password?". */
  forgotPasswordHref: string;
  /** Optional footer content, e.g. a "Sign up" link (client-only). */
  footer?: ReactNode;
  defaultEmail?: string;
  defaultPassword?: string;
}

/**
 * Shared login form UI for all four role-scoped login surfaces
 * (/admin/login, /agent/login, /owner/login, /login for client).
 * Role is fixed by the page that renders this component — there is no
 * role picker. The server checks the account's Cognito group against it.
 */
export default function LoginForm({
  role,
  heading,
  onSubmit,
  isLoading = false,
  error,
  notice,
  forgotPasswordHref,
  footer,
  defaultEmail = "",
  defaultPassword = "",
}: LoginFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(email.trim(), password);
  };

  return (
    <AuthCard heading={heading} error={error} notice={notice} footer={footer}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="sr-only" htmlFor={`${role}-email-input`}>
            Email
          </label>
          <input
            id={`${role}-email-input`}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className={AUTH_INPUT_CLASS}
          />
        </div>

        <div>
          <label className="sr-only" htmlFor={`${role}-password-input`}>
            Password
          </label>
          <input
            id={`${role}-password-input`}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className={AUTH_INPUT_CLASS}
          />
          <div className="mt-2 text-right">
            <Link
              to={forgotPasswordHref}
              className="text-xs text-neutral-600 underline hover:text-black"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <AuthSubmitButton
          isLoading={isLoading}
          label="Log in"
          loadingLabel="Authenticating..."
        />
      </form>
    </AuthCard>
  );
}
