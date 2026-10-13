import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { DASHBOARD_PATH_BY_ROLE, safeRedirect, withQuery } from "@/auth/authPaths";
import { isValidCode } from "@/auth/passwordPolicy";
import { AuthCard, AuthPageLayout, AuthSubmitButton } from "@/features/auth/AuthCard";
import { AUTH_INPUT_CLASS, AUTH_LINK_CLASS } from "@/features/auth/authStyles";

const RESEND_COOLDOWN_SECONDS = 30;

/**
 * Step 2 of client signup: enter the 6-digit code Cognito emailed.
 * Reached from /signup, or from /login when an unconfirmed account tries
 * to sign in. Confirming does not log the user in — Cognito issues no
 * tokens here — so on success we send them to /login with their email
 * pre-filled.
 */
export default function ConfirmSignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { confirmSignup, resendSignupCode } = useAuth();

  const redirectTo = safeRedirect(
    searchParams.get("redirect"),
    DASHBOARD_PATH_BY_ROLE.client,
  );
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter the email you signed up with.");
      return;
    }
    if (!isValidCode(code)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setNotice(null);
    const result = await confirmSignup(trimmedEmail, code);
    setIsLoading(false);

    if (result.status === "error") {
      setError(result.message);
      return;
    }
    navigate(
      withQuery("/login", { notice: "verified", email: trimmedEmail, redirect: redirectTo }),
      { replace: true },
    );
  };

  const handleResend = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Enter your email first so we know where to send the code.");
      return;
    }
    setError(null);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    const result = await resendSignupCode(trimmedEmail);
    if (result.status === "error") {
      setError(result.message);
      return;
    }
    setNotice(`We've sent a new code to ${trimmedEmail}.`);
  };

  return (
    <AuthPageLayout>
      <AuthCard
        heading="Verify your email"
        description={
          searchParams.get("email")
            ? `We've sent a 6-digit code to ${searchParams.get("email")}. Enter it below to activate your account.`
            : "Enter the 6-digit code we emailed you to activate your account."
        }
        error={error}
        notice={notice}
        footer={
          <>
            Already verified?{" "}
            <Link to={withQuery("/login", { redirect: redirectTo })} className={AUTH_LINK_CLASS}>
              Login
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="sr-only" htmlFor="confirm-email">
              Email
            </label>
            <input
              id="confirm-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className={AUTH_INPUT_CLASS}
            />
          </div>

          <div>
            <label className="sr-only" htmlFor="confirm-code">
              Verification code
            </label>
            <input
              id="confirm-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="6-digit code"
              required
              className={`${AUTH_INPUT_CLASS} tracking-[0.4em] text-center font-mono`}
            />
          </div>

          <AuthSubmitButton isLoading={isLoading} label="Verify" loadingLabel="Verifying..." />
        </form>

        <div className="mt-5 text-center text-xs text-neutral-600">
          Didn&apos;t get it?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0}
            className="font-semibold text-neutral-950 underline hover:text-black cursor-pointer disabled:no-underline disabled:text-neutral-400 disabled:cursor-not-allowed"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </div>
      </AuthCard>
    </AuthPageLayout>
  );
}
