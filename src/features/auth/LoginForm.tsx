import { useState, type FormEvent } from "react";
import type { UserRole } from "@/types/auth";

export interface LoginFormProps {
  /** The role this login surface is scoped to. Not user-selectable. */
  role: UserRole;
  heading: string;
  /** Called with the submitted credentials once client-side validation passes. */
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
  error?: string | null;
  /** Optional footer content, e.g. a "Sign up" link (client-only). */
  footer?: React.ReactNode;
  defaultEmail?: string;
  defaultPassword?: string;
}

/**
 * Shared login form UI for all four role-scoped login surfaces
 * (/admin/login, /agent/login, /owner/login, /login for client).
 * Role is fixed by the page that renders this component — there is no
 * role picker here. See auth/AuthContext.tsx for why: role must come from
 * the authenticated identity (Cognito group claim), never from the UI.
 */
export default function LoginForm({
  role,
  heading,
  onSubmit,
  isLoading = false,
  error,
  footer,
  defaultEmail = "",
  defaultPassword = "",
}: LoginFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <div className="w-full max-w-[440px] bg-white p-8 sm:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.06)] border border-neutral-100">
      <h1 className="text-xl sm:text-2xl font-semibold text-neutral-950 tracking-tight text-left mb-8 leading-snug">
        {heading}
      </h1>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="sr-only" htmlFor={`${role}-email-input`}>
            Email
          </label>
          <input
            id={`${role}-email-input`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-3.5 bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-1 focus:ring-black transition"
          />
        </div>

        <div>
          <label className="sr-only" htmlFor={`${role}-password-input`}>
            Password
          </label>
          <input
            id={`${role}-password-input`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-3.5 bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-1 focus:ring-black transition"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-semibold text-sm tracking-wide transition duration-150 cursor-pointer disabled:opacity-75"
          >
            {isLoading ? "Authenticating..." : "Log in"}
          </button>
        </div>
      </form>

      {footer && <div className="mt-8 text-center text-xs text-neutral-600">{footer}</div>}
    </div>
  );
}
