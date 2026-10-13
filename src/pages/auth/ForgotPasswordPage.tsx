import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { LOGIN_PATH_BY_ROLE, parseRole, withQuery } from "@/auth/authPaths";
import { isValidCode, meetsPasswordPolicy } from "@/auth/passwordPolicy";
import {
  AuthCard,
  AuthPageLayout,
  AuthSubmitButton,
  PasswordRequirements,
} from "@/features/auth/AuthCard";
import { AUTH_INPUT_CLASS, AUTH_LINK_CLASS } from "@/features/auth/authStyles";

/**
 * Two-step password reset shared by all four roles:
 * 1. Enter email → Cognito emails a 6-digit code.
 * 2. Enter code + new password.
 *
 * `?role=` only decides which login page to return to; it grants nothing.
 * Step 1 always shows the same message whether or not the email exists,
 * so the page can't be used to discover registered accounts.
 */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { forgotPassword, resetPassword } = useAuth();

  const role = parseRole(searchParams.get("role"));
  const loginPath = LOGIN_PATH_BY_ROLE[role];

  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }
    setIsLoading(true);
    setError(null);
    const result = await forgotPassword(trimmedEmail);
    setIsLoading(false);

    // Only surface transport-level failures; never reveal whether the account exists.
    if (result.status === "error" && result.code === "network_error") {
      setError(result.message);
      return;
    }
    setNotice(
      `If an account exists for ${trimmedEmail}, we've emailed a 6-digit code. It may take a minute to arrive.`,
    );
    setStep("reset");
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidCode(code)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
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
    const result = await resetPassword(email.trim(), code, password);
    setIsLoading(false);

    if (result.status === "error") {
      setError(result.message);
      return;
    }
    navigate(withQuery(loginPath, { notice: "reset", email: email.trim() }), {
      replace: true,
    });
  };

  const footer = (
    <>
      Remembered it?{" "}
      <Link to={loginPath} className={AUTH_LINK_CLASS}>
        Back to login
      </Link>
    </>
  );

  if (step === "request") {
    return (
      <AuthPageLayout>
        <AuthCard
          heading="Reset your password"
          description="Enter the email you use to log in and we'll send you a code to reset your password."
          error={error}
          footer={footer}
        >
          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label className="sr-only" htmlFor="forgot-email">
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className={AUTH_INPUT_CLASS}
              />
            </div>
            <AuthSubmitButton isLoading={isLoading} label="Send code" loadingLabel="Sending..." />
          </form>
        </AuthCard>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout>
      <AuthCard
        heading="Choose a new password"
        error={error}
        notice={notice}
        footer={footer}
      >
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="sr-only" htmlFor="reset-code">
              Reset code
            </label>
            <input
              id="reset-code"
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

          <div>
            <label className="sr-only" htmlFor="reset-password">
              New password
            </label>
            <input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              required
              aria-describedby="reset-password-rules"
              className={AUTH_INPUT_CLASS}
            />
            <PasswordRequirements id="reset-password-rules" password={password} />
          </div>

          <div>
            <label className="sr-only" htmlFor="reset-password-confirm">
              Confirm new password
            </label>
            <input
              id="reset-password-confirm"
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
            label="Reset password"
            loadingLabel="Resetting..."
          />
        </form>

        <div className="mt-5 text-center text-xs text-neutral-600">
          Wrong email?{" "}
          <button
            type="button"
            onClick={() => {
              setStep("request");
              setCode("");
              setError(null);
              setNotice(null);
            }}
            className={AUTH_LINK_CLASS}
          >
            Start again
          </button>
        </div>
      </AuthCard>
    </AuthPageLayout>
  );
}
