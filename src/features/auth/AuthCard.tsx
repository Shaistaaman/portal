import type { ReactNode } from "react";
import { Check, Circle } from "lucide-react";
import PublicHeader from "@/components/layout/PublicHeader";
import { PASSWORD_RULES } from "@/auth/passwordPolicy";

/** Page frame shared by every auth screen: public header + centred card area. */
export function AuthPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-[#fcfbf9]">
        {children}
      </main>
    </div>
  );
}

interface AuthCardProps {
  heading: string;
  /** Short explanatory line under the heading. */
  description?: ReactNode;
  error?: string | null;
  /** Success/info message, e.g. "Email verified. Please log in." */
  notice?: string | null;
  footer?: ReactNode;
  children: ReactNode;
  /** Card width; signup is slightly wider for the two-column name row. */
  width?: "md" | "lg";
}

export function AuthCard({
  heading,
  description,
  error,
  notice,
  footer,
  children,
  width = "md",
}: AuthCardProps) {
  return (
    <div
      className={`w-full ${width === "lg" ? "max-w-[460px]" : "max-w-[440px]"} bg-white p-8 sm:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.06)] border border-neutral-100`}
    >
      <h1 className="text-xl sm:text-2xl font-semibold text-neutral-950 tracking-tight text-left mb-3 leading-snug">
        {heading}
      </h1>
      {description && (
        <p className="mb-6 text-sm text-neutral-600 leading-relaxed">{description}</p>
      )}
      {!description && <div className="mb-5" />}

      {notice && (
        <div
          role="status"
          className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs leading-relaxed"
        >
          {notice}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed"
        >
          {error}
        </div>
      )}

      {children}

      {footer && (
        <div className="mt-8 text-center text-xs text-neutral-600">{footer}</div>
      )}
    </div>
  );
}

export function AuthSubmitButton({
  isLoading,
  label,
  loadingLabel,
}: {
  isLoading: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <div className="pt-2">
      <button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-semibold text-sm tracking-wide transition duration-150 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
      >
        {isLoading ? loadingLabel : label}
      </button>
    </div>
  );
}

/** Live checklist of the Cognito password policy. */
export function PasswordRequirements({ password, id }: { password: string; id: string }) {
  return (
    <ul id={id} className="mt-2 space-y-1 text-[11px]" aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.id}
            className={`flex items-center gap-1.5 ${met ? "text-emerald-700" : "text-neutral-500"}`}
          >
            {met ? (
              <Check className="w-3 h-3" aria-hidden="true" />
            ) : (
              <Circle className="w-3 h-3" aria-hidden="true" />
            )}
            <span>
              {rule.label}
              <span className="sr-only">{met ? " (met)" : " (not met)"}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
